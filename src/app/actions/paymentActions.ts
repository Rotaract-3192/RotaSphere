"use server"
 
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { auth, currentUser } from "@clerk/nextjs/server"
import Razorpay from "razorpay"
import crypto from "crypto"
import { mapRowToEventItem } from "@/lib/eventMapper"
import { sendEmail } from "@/lib/nodemailer"
import { getCallerProfile, logAuditAction } from "@/app/actions/eventActions"
import { logEvent } from "@/lib/logger"
 
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

const isRazorpayConfigured = !!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)

// Initialize Razorpay conditionally
let razorpay: Razorpay | null = null
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID!,
    key_secret: RAZORPAY_KEY_SECRET!,
  })
}

function generateTicketCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "ROTA-"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += "-"
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function createRazorpayOrderAction(eventId: string, ticketCount: number = 1) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Unauthorized. You must be signed in to book tickets." }
    }

    if (!isSupabaseAdminConfigured) {
      return { success: false, error: "Database not configured." }
    }

    // Check if eventId is a mock ID (not a valid UUID)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)
    if (!isUuid) {
      console.warn(`Event ID ${eventId} is a mock ID. Creating simulated order.`)
      return {
        success: true,
        orderId: `order_sim_${Date.now()}`,
        amount: 1000 * ticketCount, // Default INR 10.00 equivalent per ticket in paise/cents
        currency: "INR",
        keyId: "rzp_test_simulated_key",
        simulated: true
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle()

    if (eventError || !event) {
      return { success: false, error: "Event not found" }
    }

    if (event.type === "free") {
      return { success: false, error: "This is a free event. Use bookFreeTicketAction instead." }
    }

    if (event.registrations_disabled) {
      return { success: false, error: "Registrations for this event have been paused by the organizer." }
    }

    // Check capacity
    if ((event.attendees_count || 0) + ticketCount > event.capacity) {
      return { success: false, error: "Event capacity reached or ticket count exceeds remaining capacity." }
    }

    const price = parseFloat(String(event.price || 0))
    const amountInPaise = Math.round(price * ticketCount * 100)

    // Check if Razorpay keys are configured
    if (!isRazorpayConfigured || !razorpay) {
      console.warn("Razorpay keys missing. Creating simulated order.")
      return {
        success: true,
        orderId: `order_sim_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_simulated_key",
        simulated: true
      }
    }

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${eventId.substring(0, 8)}_${Date.now().toString().substring(5)}`,
    }

    const order = await razorpay.orders.create(options)

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      simulated: false
    }
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create order" }
  }
}

export async function checkClubEarlyBirdLimitAction(eventId: string, clubName: string) {
  try {
    if (!isSupabaseAdminConfigured) {
      return { success: true, count: 0, simulated: true }
    }
    
    // Count existing early bird bookings for this club (excluding rejected tickets)
    const { data, error } = await supabaseAdmin
      .from("attendees")
      .select("ticket_id, tickets!inner(status, ticket_tier_id)")
      .eq("event_id", eventId)
      .eq("club_name", clubName)
      .eq("tickets.ticket_tier_id", "early-bird")
      .neq("tickets.status", "rejected")
      
    if (error) throw error
    
    return { success: true, count: data?.length || 0 }
  } catch (err) {
    console.error("Error checking club limit:", err)
    return { success: false, error: "Failed to check club ticket limit" }
  }
}

export async function verifyPaymentAndBookTicketAction(input: {
  eventId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  isSimulated?: boolean;
  ticketCount?: number;
  fullName?: string;
  email?: string;
  additionalAttendees?: { fullName: string; email: string; designation?: string }[];
  ticketTierId?: string;
  ticketTierName?: string;
  clubName?: string;
  designation?: string;
}) {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    if (!userId || !clerkUser) {
      return { success: false, error: "Unauthorized. You must be signed in." }
    }

    if (!isSupabaseAdminConfigured) {
      return { success: false, error: "Database not configured." }
    }

    const ticketCount = input.ticketCount || 1
    const formFullName = input.fullName || clerkUser.fullName || clerkUser.username || "Attendee"
    const formEmail = input.email || clerkUser.primaryEmailAddress?.emailAddress || ""

    // Check if eventId is a mock ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.eventId)
    if (!isUuid) {
      console.warn(`Verifying payment for mock event ${input.eventId}`)
      const ticketCodes = Array.from({ length: ticketCount }).map((_, i) => `ROTA-MOCK-${Date.now().toString().substring(8)}-${i + 1}`)
      return {
        success: true,
        ticketCode: ticketCodes.join(", "),
        ticketId: `ticket_mock_${Date.now()}`
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", input.eventId)
      .maybeSingle()

    if (eventError || !event) {
      return { success: false, error: "Event not found." }
    }

    // Enforce club-specific Early Bird limit of 5 tickets
    if (input.ticketTierId === "early-bird" && input.clubName && input.clubName !== "Non-Rotaractor") {
      const { count, success } = await checkClubEarlyBirdLimitAction(input.eventId, input.clubName)
      if (success && count !== undefined) {
        if (count >= 5) {
          return { success: false, error: "Early Bird tickets sold out for your club" }
        }
        if (count + ticketCount > 5) {
          return { success: false, error: `Only ${5 - count} Early Bird tickets can be booked for your club. Your request of ${ticketCount} tickets exceeds this limit.` }
        }
      }
    }

    // Signature verification (only if not simulated)
    if (!input.isSimulated && isRazorpayConfigured) {
      const generated = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET!)
        .update(`${input.orderId}|${input.paymentId}`)
        .digest("hex")

      if (generated !== input.signature) {
        return { success: false, error: "Payment verification failed. Invalid signature." }
      }
    }

    // Create tickets & registration
    const createdTickets = []
    let primaryTicketId = ""

    // Determine the price paid from the selected ticket tier
    const tiers = event.ticket_tiers || []
    const selectedTier = tiers.find((t: any) => t.id === input.ticketTierId)
    const pricePaid = selectedTier ? selectedTier.price : (event.price || 0)

    for (let i = 0; i < ticketCount; i++) {
      const ticketCode = generateTicketCode()
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from("tickets")
        .insert({
          event_id: input.eventId,
          user_id: userId,
          ticket_code: ticketCode,
          price_paid: pricePaid,
          status: "active",
          payment_id: input.paymentId,
          order_id: input.orderId,
          ticket_tier_id: input.ticketTierId,
          ticket_tier_name: input.ticketTierName
        })
        .select()
        .single()

      if (ticketError) throw ticketError
      createdTickets.push(ticket)

      if (i === 0) {
        primaryTicketId = ticket.id
      }

      const attendeeName = i === 0 
        ? formFullName 
        : (input.additionalAttendees?.[i - 1]?.fullName || `Attendee ${i + 1}`);
      const attendeeEmail = i === 0 
        ? formEmail 
        : (input.additionalAttendees?.[i - 1]?.email || "");
      const attendeeDesignation = i === 0 
        ? input.designation 
        : (input.additionalAttendees?.[i - 1]?.designation || "");

      let finalAttendeeEmail = attendeeEmail ? attendeeEmail.trim() : ""
      if (!finalAttendeeEmail && i > 0) {
        finalAttendeeEmail = formEmail.includes("@")
          ? formEmail.replace("@", `+guest${i + 1}@`)
          : `${formEmail}_guest${i + 1}`
      }

      // Create attendee registration
      let { error: attendeeError } = await supabaseAdmin
        .from("attendees")
        .insert({
          event_id: input.eventId,
          clerk_id: userId,
          email: finalAttendeeEmail || formEmail,
          full_name: attendeeName,
          ticket_id: ticket.id,
          club_name: input.clubName,
          designation: attendeeDesignation
        })

      // Retry with unique ticket suffix if unique constraint triggered
      if (attendeeError && (attendeeError.code === "23505" || attendeeError.message?.includes("unique"))) {
        const uniqueEmail = formEmail.includes("@")
          ? formEmail.replace("@", `+pass_${ticket.id.substring(0, 6)}@`)
          : `${formEmail}_pass_${ticket.id.substring(0, 6)}`

        const retryRes = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: input.eventId,
            clerk_id: userId,
            email: uniqueEmail,
            full_name: attendeeName,
            ticket_id: ticket.id,
            club_name: input.clubName,
            designation: attendeeDesignation
          })
        attendeeError = retryRes.error
      }

      if (attendeeError && i === 0) {
        // Rollback tickets only if primary attendee failed
        for (const t of createdTickets) {
          await supabaseAdmin.from("tickets").delete().eq("id", t.id)
        }
        return { 
          success: false, 
          error: "You are already registered for this event." 
        }
      }
    }

    // Sync home_club & designation to user profile
    if (userId) {
      const updateObj: any = {}
      if (input.clubName) updateObj.home_club = input.clubName
      if (input.designation) updateObj.designation = input.designation
      if (Object.keys(updateObj).length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update(updateObj)
          .eq("id", userId)
      }
    }

    const updatedTiers = tiers.map((t: any) => {
      if (t.id === input.ticketTierId) {
        return { ...t, ticketsSold: (t.ticketsSold || 0) + ticketCount }
      }
      return t
    })

    // Increment attendee count by ticketCount and update ticket tiers
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({
        attendees_count: (event.attendees_count || 0) + ticketCount,
        ticket_tiers: updatedTiers,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.eventId)

    if (updateError) throw updateError

    return {
      success: true,
      ticketCode: createdTickets.map(t => t.ticket_code).join(", "),
      ticketId: primaryTicketId
    }
  } catch (error) {
    console.error("Error in verifyPaymentAndBookTicketAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to book ticket" }
  }
}

export async function bookFreeTicketAction(
  eventId: string,
  ticketCount: number = 1,
  fullName?: string,
  email?: string,
  additionalAttendees?: { fullName: string; email: string; designation?: string }[],
  clubName?: string,
  designation?: string
) {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    if (!userId || !clerkUser) {
      return { success: false, error: "Unauthorized. You must be signed in." }
    }

    if (!isSupabaseAdminConfigured) {
      return { success: false, error: "Database not configured." }
    }

    const formFullName = fullName || clerkUser.fullName || clerkUser.username || "Attendee"
    const formEmail = email || clerkUser.primaryEmailAddress?.emailAddress || ""

    // Check if eventId is a mock ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eventId)
    if (!isUuid) {
      console.warn(`Booking free ticket for mock event ${eventId}`)
      const ticketCodes = Array.from({ length: ticketCount }).map((_, i) => `ROTA-MOCK-FREE-${Date.now().toString().substring(8)}-${i + 1}`)
      return {
        success: true,
        ticketCode: ticketCodes.join(", "),
        ticketId: `ticket_mock_${Date.now()}`
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle()

    if (eventError || !event) {
      return { success: false, error: "Event not found." }
    }

    if (event.type !== "free") {
      return { success: false, error: "This is a paid event. Please complete checkout." }
    }

    if (event.registrations_disabled) {
      return { success: false, error: "Registrations for this event have been paused by the organizer." }
    }

    // Check capacity
    if ((event.attendees_count || 0) + ticketCount > event.capacity) {
      return { success: false, error: "Event capacity reached or ticket count exceeds remaining capacity." }
    }

    // Create tickets & registration
    const createdTickets = []
    let primaryTicketId = ""

    for (let i = 0; i < ticketCount; i++) {
      const ticketCode = generateTicketCode()
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from("tickets")
        .insert({
          event_id: eventId,
          user_id: userId,
          ticket_code: ticketCode,
          price_paid: 0,
          status: "active"
        })
        .select()
        .single()

      if (ticketError) throw ticketError
      createdTickets.push(ticket)

      if (i === 0) {
        primaryTicketId = ticket.id
      }

      const attendeeName = i === 0 
        ? formFullName 
        : (additionalAttendees?.[i - 1]?.fullName || `Attendee ${i + 1}`);
      const attendeeEmail = i === 0 
        ? formEmail 
        : (additionalAttendees?.[i - 1]?.email || "");
      const attendeeDesignation = i === 0 
        ? designation 
        : (additionalAttendees?.[i - 1]?.designation || "");

      let finalAttendeeEmail = attendeeEmail ? attendeeEmail.trim() : ""
      if (!finalAttendeeEmail && i > 0) {
        finalAttendeeEmail = formEmail.includes("@")
          ? formEmail.replace("@", `+guest${i + 1}@`)
          : `${formEmail}_guest${i + 1}`
      }

      // Create attendee registration
      let { error: attendeeError } = await supabaseAdmin
        .from("attendees")
        .insert({
          event_id: eventId,
          clerk_id: userId,
          email: finalAttendeeEmail || formEmail,
          full_name: attendeeName,
          ticket_id: ticket.id,
          club_name: clubName,
          designation: attendeeDesignation
        })

      // Retry with unique ticket suffix if unique constraint triggered
      if (attendeeError && (attendeeError.code === "23505" || attendeeError.message?.includes("unique"))) {
        const uniqueEmail = formEmail.includes("@")
          ? formEmail.replace("@", `+pass_${ticket.id.substring(0, 6)}@`)
          : `${formEmail}_pass_${ticket.id.substring(0, 6)}`

        const retryRes = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: eventId,
            clerk_id: userId,
            email: uniqueEmail,
            full_name: attendeeName,
            ticket_id: ticket.id,
            club_name: clubName,
            designation: attendeeDesignation
          })
        attendeeError = retryRes.error
      }

      if (attendeeError && i === 0) {
        // Rollback tickets only if primary attendee failed
        for (const t of createdTickets) {
          await supabaseAdmin.from("tickets").delete().eq("id", t.id)
        }
        return { 
          success: false, 
          error: "You are already registered for this event." 
        }
      }
    }

    // Sync home_club & designation to user profile
    if (userId) {
      const updateObj: any = {}
      if (clubName) updateObj.home_club = clubName
      if (designation) updateObj.designation = designation
      if (Object.keys(updateObj).length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update(updateObj)
          .eq("id", userId)
      }
    }

    // Increment attendee count by ticketCount
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({
        attendees_count: (event.attendees_count || 0) + ticketCount,
        updated_at: new Date().toISOString()
      })
      .eq("id", eventId)

    if (updateError) throw updateError

    return {
      success: true,
      ticketCode: createdTickets.map(t => t.ticket_code).join(", "),
      ticketId: primaryTicketId
    }
  } catch (error) {
    console.error("Error in bookFreeTicketAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to book ticket" }
  }
}

export async function getBookedTicketsAction() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    if (!isSupabaseAdminConfigured) {
      return { success: true, tickets: [], simulated: true }
    }

    const { data, error } = await supabaseAdmin
      .from("tickets")
      .select("*, event:events(*)")
      .eq("user_id", userId)

    if (error) throw error

    // Map to EventItem structure
    const mapped = (data || [])
      .filter((t: any) => t.event)
      .map((t: any) => {
        const item = mapRowToEventItem(t.event)
        // Add ticket specific properties
        item.ticketId = t.id
        item.ticketCode = t.ticket_code
        item.pricePaid = t.price_paid
        item.status = t.status
        item.purchasedAt = t.purchased_at
        return item
      })

    return { success: true, tickets: mapped, simulated: false }
  } catch (error) {
    console.error("Error in getBookedTicketsAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tickets" }
  }
}

async function uploadScreenshotToSupabase(base64Str: string): Promise<string> {
  try {
    if (!base64Str || !base64Str.startsWith("data:")) {
      // If it's already a URL or empty, return it directly
      return base64Str;
    }

    const parts = base64Str.split(",");
    if (parts.length < 2) return base64Str;

    const mimeMatch = parts[0].match(/data:(.*?);/);
    const contentType = mimeMatch ? mimeMatch[1] : "image/png";
    const base64Data = parts[1];

    // Decode base64 to Buffer
    const buffer = Buffer.from(base64Data, "base64");
    const fileExt = contentType.split("/")[1] || "png";
    const fileName = `screenshot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    // Upload using Supabase Admin client to bypass RLS policies
    const { data, error } = await supabaseAdmin.storage
      .from("RotaSphere")
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: true
      });

    if (error) {
      console.error("Failed to upload screenshot to Supabase Storage RotaSphere:", error);
      throw error;
    }

    // Return the bucket path (not public URL) - we'll generate signed URLs on retrieval
    // This is safer for private buckets and allows dynamic signed URL generation
    return `RotaSphere/${fileName}`;
  } catch (err) {
    console.error("uploadScreenshotToSupabase helper failed:", err);
    return base64Str; // Return base64 as fallback to avoid request blockage
  }
}

export async function bookOfflinePaidTicketAction(input: {
  eventId: string;
  ticketCount: number;
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
  additionalAttendees?: { fullName: string; email: string; designation?: string }[];
  screenshotBase64: string;
  ticketTierId?: string;
  ticketTierName?: string;
  clubName?: string;
  designation?: string;
}) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Unauthorized. You must be signed in to book tickets." }
    }

    const ticketCount = input.ticketCount || 1
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.eventId)

    if (!isSupabaseAdminConfigured || !isUuid) {
      const ticketCodes = Array.from({ length: ticketCount }).map(() => generateTicketCode())
      return {
        success: true,
        simulated: true,
        ticketCode: ticketCodes.join(", "),
        ticketId: `ticket_offline_sim_${Date.now()}`
      }
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", input.eventId)
      .maybeSingle()

    if (eventError || !event) {
      const ticketCodes = Array.from({ length: ticketCount }).map(() => generateTicketCode())
      return {
        success: true,
        simulated: true,
        ticketCode: ticketCodes.join(", "),
        ticketId: `ticket_offline_sim_${Date.now()}`
      }
    }

    // Enforce club-specific Early Bird limit of 5 tickets
    if (input.ticketTierId === "early-bird" && input.clubName && input.clubName !== "Non-Rotaractor") {
      const { count, success } = await checkClubEarlyBirdLimitAction(input.eventId, input.clubName)
      if (success && count !== undefined) {
        if (count >= 5) {
          return { success: false, error: "Early Bird tickets sold out for your club" }
        }
        if (count + ticketCount > 5) {
          return { success: false, error: `Only ${5 - count} Early Bird tickets can be booked for your club. Your request of ${ticketCount} tickets exceeds this limit.` }
        }
      }
    }

    if (event.registrations_disabled) {
      return { success: false, error: "Registrations for this event have been paused by the organizer." }
    }

    // Check capacity
    if ((event.attendees_count || 0) + ticketCount > event.capacity) {
      return { success: false, error: "Event capacity reached or ticket count exceeds remaining capacity." }
    }

    // Upload receipt screenshot to Supabase Storage bucket 'RotaSphere'
    const screenshotUrl = await uploadScreenshotToSupabase(input.screenshotBase64)

    const orderId = `offline_order_${Date.now()}`
    const createdTickets = []
    let primaryTicketId = ""

    // Determine the price paid from the selected ticket tier
    const tiers = event.ticket_tiers || []
    const selectedTier = tiers.find((t: any) => t.id === input.ticketTierId)
    const pricePaid = selectedTier ? selectedTier.price : (event.price || 0)

    for (let i = 0; i < ticketCount; i++) {
      const ticketCode = generateTicketCode()
      
      // Attempt insert. Check if payment_screenshot_url is in schema, otherwise use fallback
      let ticketInsertData: any = {
        event_id: input.eventId,
        user_id: userId,
        ticket_code: ticketCode,
        price_paid: pricePaid,
        status: "pending",
        order_id: orderId,
        payment_id: "offline_upi",
        ticket_tier_id: input.ticketTierId,
        ticket_tier_name: input.ticketTierName
      }

      // We'll write to both screenshot column AND fallback in order_id/payment_id if column missing
      try {
        const { data: ticket, error: ticketError } = await supabaseAdmin
          .from("tickets")
          .insert({
            ...ticketInsertData,
            payment_screenshot_url: screenshotUrl
          })
          .select()
          .single()

        if (ticketError) {
          // If column is missing, insert without screenshot url and save screenshot in payment_id
          console.warn("Screenshot column insert failed. Falling back to payment_id storage:", ticketError.message)
          const { data: fallbackTicket, error: fallbackError } = await supabaseAdmin
            .from("tickets")
            .insert({
              ...ticketInsertData,
              payment_id: screenshotUrl // fallback
            })
            .select()
            .single()

          if (fallbackError) throw fallbackError
          createdTickets.push(fallbackTicket)
          if (i === 0) primaryTicketId = fallbackTicket.id
        } else {
          createdTickets.push(ticket)
          if (i === 0) primaryTicketId = ticket.id
        }
      } catch (err) {
        console.error("Ticket insert failed:", err)
        throw err
      }

      const currentTicket = createdTickets[createdTickets.length - 1]
      const attendeeName = i === 0 
        ? input.fullName 
        : (input.additionalAttendees?.[i - 1]?.fullName || `Attendee ${i + 1}`);
      const attendeeEmail = i === 0 
        ? input.email 
        : (input.additionalAttendees?.[i - 1]?.email || "");
      const attendeeDesignation = i === 0 
        ? input.designation 
        : (input.additionalAttendees?.[i - 1]?.designation || "");

      let finalAttendeeEmail = attendeeEmail ? attendeeEmail.trim() : ""
      if (!finalAttendeeEmail && i > 0) {
        finalAttendeeEmail = input.email.includes("@")
          ? input.email.replace("@", `+guest${i + 1}@`)
          : `${input.email}_guest${i + 1}`
      }

      // Create attendee registration
      let { error: attendeeError } = await supabaseAdmin
        .from("attendees")
        .insert({
          event_id: input.eventId,
          clerk_id: userId,
          email: finalAttendeeEmail || input.email,
          full_name: attendeeName,
          ticket_id: currentTicket.id,
          club_name: input.clubName,
          designation: attendeeDesignation
        })

      // Retry with unique ticket suffix if unique constraint triggered
      if (attendeeError && (attendeeError.code === "23505" || attendeeError.message?.includes("unique"))) {
        const uniqueEmail = input.email.includes("@")
          ? input.email.replace("@", `+pass_${currentTicket.id.substring(0, 6)}@`)
          : `${input.email}_pass_${currentTicket.id.substring(0, 6)}`

        const retryRes = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: input.eventId,
            clerk_id: userId,
            email: uniqueEmail,
            full_name: attendeeName,
            ticket_id: currentTicket.id,
            club_name: input.clubName,
            designation: attendeeDesignation
          })
        attendeeError = retryRes.error
      }

      if (attendeeError && i === 0) {
        // Rollback only if primary attendee failed
        for (const t of createdTickets) {
          await supabaseAdmin.from("tickets").delete().eq("id", t.id)
        }
        return { 
          success: false, 
          error: "You are already registered for this event." 
        }
      }
    }

    // Sync home_club & designation to user profile
    if (userId) {
      const updateObj: any = {}
      if (input.clubName) updateObj.home_club = input.clubName
      if (input.designation) updateObj.designation = input.designation
      if (Object.keys(updateObj).length > 0) {
        await supabaseAdmin
          .from("profiles")
          .update(updateObj)
          .eq("id", userId)
      }
    }

    const updatedTiers = tiers.map((t: any) => {
      if (t.id === input.ticketTierId) {
        return { ...t, ticketsSold: (t.ticketsSold || 0) + ticketCount }
      }
      return t
    })

    // Increment attendee count by ticketCount and update ticket tiers in Supabase events table
    await supabaseAdmin
      .from("events")
      .update({
        attendees_count: (event.attendees_count || 0) + ticketCount,
        ticket_tiers: updatedTiers,
        updated_at: new Date().toISOString()
      })
      .eq("id", input.eventId)

    const ticketCodes = createdTickets.map(t => t.ticket_code).join(", ")

    // Send confirmation email that payment is received and pending admin approval
    const emailHtml = `
      <div style="font-family: 'Inter', sans-serif; background-color: #041C32; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(30,136,229,0.2);">
        <h2 style="font-family: 'Outfit', sans-serif; color: #38BDF8; font-size: 24px; margin-bottom: 20px;">Ticket Request Received - Verification Pending</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Hello ${input.fullName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">We have received your payment screenshot for <strong>${event.title}</strong>. Our admin team will verify the payment transaction and approve your tickets shortly.</p>
        
        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #38BDF8; font-size: 14px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;">Booking Overview</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Event:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right;">${event.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Quantity:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right;">${ticketCount} Ticket(s)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Ticket Codes (Pending):</td>
              <td style="padding: 6px 0; font-family: 'IBM Plex Mono', monospace; text-align: right; color: #94a3b8;">${ticketCodes}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">Once approved, you will receive a second email containing your confirmed active passes. Thank you for your patience!</p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;" />
        <span style="font-size: 12px; color: #64748b; display: block; text-align: center;">RotaSphere Platform Operations</span>
      </div>
    `

    await sendEmail({
      to: input.email,
      subject: `🎟️ Ticket Request Received - Verification Pending`,
      html: emailHtml
    })

    return {
      success: true,
      ticketCode: ticketCodes,
      ticketId: primaryTicketId
    }
  } catch (error) {
    console.error("Error in bookOfflinePaidTicketAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to register offline request" }
  }
}

export async function approveTicketAction(ticketId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!isSupabaseAdminConfigured) {
      return { success: false, error: "Database not configured." }
    }

    // Fetch the ticket to find the order_id
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .select("*, event:events(*)")
      .eq("id", ticketId)
      .maybeSingle()

    if (ticketError || !ticket) {
      return { success: false, error: "Ticket booking not found." }
    }

    const orderId = ticket.order_id
    const event = ticket.event
    if (!event) return { success: false, error: "Event details not found." }

    // Fetch all tickets sharing this order_id
    const { data: orderTickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("id, ticket_code")
      .eq("order_id", orderId)

    if (ticketsError || !orderTickets || orderTickets.length === 0) {
      return { success: false, error: "Order details not found." }
    }

    const ticketIds = orderTickets.map(t => t.id)
    const ticketCodes = orderTickets.map(t => t.ticket_code).join(", ")

    // Update tickets status to active
    const { error: updateError } = await supabaseAdmin
      .from("tickets")
      .update({ status: "active" })
      .in("id", ticketIds)

    if (updateError) throw updateError

    const eventTiers = event.ticket_tiers || []
    const updatedTiers = eventTiers.map((t: any) => {
      if (t.id === ticket.ticket_tier_id) {
        return { ...t, ticketsSold: (t.ticketsSold || 0) + ticketIds.length }
      }
      return t
    })

    // Increment event attendees count and update ticket tiers
    const { error: capacityError } = await supabaseAdmin
      .from("events")
      .update({
        attendees_count: (event.attendees_count || 0) + ticketIds.length,
        ticket_tiers: updatedTiers,
        updated_at: new Date().toISOString()
      })
      .eq("id", event.id)

    if (capacityError) throw capacityError

    // Fetch primary attendee details to email
    const { data: attendee, error: attendeeError } = await supabaseAdmin
      .from("attendees")
      .select("email, full_name")
      .eq("ticket_id", ticketId)
      .maybeSingle()

    if (!attendeeError && attendee) {
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; background-color: #041C32; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #38BDF8/20;">
          <h2 style="font-family: 'Outfit', sans-serif; color: #22c55e; font-size: 24px; margin-bottom: 20px;">✅ Ticket Confirmed!</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Hello ${attendee.full_name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Great news! Your payment screenshot has been verified by the organizer. Your ticket request has been approved and confirmed for <strong>${event.title}</strong>.</p>
          
          <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #38BDF8; font-size: 14px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;">Your Confirmed Ticket Passes</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Event:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${event.title}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Date & Time:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${event.start_date || event.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Venue:</td>
                <td style="padding: 6px 0; font-weight: bold; text-align: right;">${event.venue_name || event.location}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #64748b;">Ticket Passes:</td>
                <td style="padding: 6px 0; font-family: 'IBM Plex Mono', monospace; text-align: right; color: #22c55e; font-weight: bold;">${ticketCodes}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #94a3b8; margin-top: 30px;">Please present your ticket codes or active passes at the check-in gate. Enjoy the event!</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;" />
          <span style="font-size: 12px; color: #64748b; display: block; text-align: center;">RotaSphere Platform Operations</span>
        </div>
      `

      await sendEmail({
        to: attendee.email,
        subject: `✅ Ticket Confirmed: ${event.title}`,
        html: emailHtml
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error in approveTicketAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Approval processing failed" }
  }
}

export async function rejectTicketAction(ticketId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!isSupabaseAdminConfigured) {
      return { success: false, error: "Database not configured." }
    }

    // Fetch the ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .select("*, event:events(*)")
      .eq("id", ticketId)
      .maybeSingle()

    if (ticketError || !ticket) {
      return { success: false, error: "Ticket booking not found." }
    }

    const orderId = ticket.order_id
    const event = ticket.event
    if (!event) return { success: false, error: "Event not found." }

    // Fetch all tickets sharing this order_id
    const { data: orderTickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("id")
      .eq("order_id", orderId)

    if (ticketsError || !orderTickets || orderTickets.length === 0) {
      return { success: false, error: "Order details not found." }
    }

    const ticketIds = orderTickets.map(t => t.id)

    // Update tickets status to rejected
    const { error: updateError } = await supabaseAdmin
      .from("tickets")
      .update({ status: "rejected" })
      .in("id", ticketIds)

    if (updateError) throw updateError

    // Fetch primary attendee details to email
    const { data: attendee, error: attendeeError } = await supabaseAdmin
      .from("attendees")
      .select("email, full_name")
      .eq("ticket_id", ticketId)
      .maybeSingle()

    if (!attendeeError && attendee) {
      const emailHtml = `
        <div style="font-family: 'Inter', sans-serif; background-color: #041C32; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #ef4444/20;">
          <h2 style="font-family: 'Outfit', sans-serif; color: #ef4444; font-size: 24px; margin-bottom: 20px;">❌ Payment Verification Rejected</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Hello ${attendee.full_name},</p>
          <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Unfortunately, the organizer was unable to verify your payment screenshot for <strong>${event.title}</strong>. Your ticket request has been rejected.</p>
          <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">If you believe this is an error, please double-check your transaction receipt and re-apply with the correct payment proof, or contact the event organizer directly.</p>
          <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;" />
          <span style="font-size: 12px; color: #64748b; display: block; text-align: center;">RotaSphere Platform Operations</span>
        </div>
      `

      await sendEmail({
        to: attendee.email,
        subject: `❌ Payment Verification Rejected: ${event.title}`,
        html: emailHtml
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error in rejectTicketAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Rejection processing failed" }
  }
}

export async function getOrganizerTicketsAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!isSupabaseAdminConfigured) {
      return { success: true, tickets: [], simulated: true }
    }

    const caller = await getCallerProfile(userId)

    // 1. Fetch event IDs: Admins & Super Admins get all events; organizers get their events
    let eventsQuery = supabaseAdmin.from("events").select("id, title")
    if (caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      eventsQuery = eventsQuery.or(`organizer_id.eq.${userId},created_by.eq.${userId}`)
    }

    let { data: events, error: eventsError } = await eventsQuery
    if (eventsError) console.warn("getOrganizerTicketsAction events query warning:", eventsError.message)

    if (!events || events.length === 0) {
      const { data: allEvents } = await supabaseAdmin.from("events").select("id, title")
      events = allEvents || []
    }

    if (!events || events.length === 0) {
      return { success: true, tickets: [] }
    }

    const eventIds = events.map(e => e.id)
    const eventTitlesMap = events.reduce((acc: any, e: any) => {
      acc[e.id] = e.title
      return acc
    }, {})

    // 2. Fetch all tickets for these events
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("*")
      .in("event_id", eventIds)
      .order("purchased_at", { ascending: false })

    if (ticketsError) throw ticketsError

    // 3. Fetch matching attendee records directly from attendees table using event_id and ticket_id
    const { data: attendeesData } = await supabaseAdmin
      .from("attendees")
      .select("ticket_id, full_name, email, clerk_id")
      .in("event_id", eventIds)

    const attendeeByTicketMap: Record<string, { full_name: string; email: string }> = {}
    const attendeeByClerkMap: Record<string, { full_name: string; email: string }> = {}

    if (attendeesData) {
      attendeesData.forEach(att => {
        if (att.ticket_id) {
          attendeeByTicketMap[att.ticket_id] = { full_name: att.full_name, email: att.email }
        }
        if (att.clerk_id && !attendeeByClerkMap[att.clerk_id]) {
          attendeeByClerkMap[att.clerk_id] = { full_name: att.full_name, email: att.email }
        }
      })
    }

    // Map to a clean structure resolving private bucket signed URLs
    const mappedPromises = (tickets || []).map(async (t: any) => {
      const matchedAttendee = attendeeByTicketMap[t.id] || attendeeByClerkMap[t.user_id]
      const primaryAttendeeName = matchedAttendee?.full_name || "Attendee Pass"
      const primaryAttendeeEmail = matchedAttendee?.email || ""
      let screenshotUrl = t.payment_screenshot_url || (
        t.payment_id && 
        t.payment_id !== "offline_upi" && 
        t.payment_id !== "organizer_manual_issue" &&
        !t.payment_id.startsWith("manual:")
          ? t.payment_id 
          : null
      )

      // If screenshot URL exists, ensure it's a signed URL for private bucket access
      if (screenshotUrl && !screenshotUrl.startsWith("data:")) {
        try {
          // Handle both formats: "RotaSphere/filename" and full URLs
          let filename = screenshotUrl
          if (screenshotUrl.startsWith("http")) {
            // Extract filename from full URL
            const url = new URL(screenshotUrl)

                filename = decodeURIComponent(
                    url.pathname.split("/RotaSphere/")[1] || ""
                )
            // If not a RotaSphere URL, keep as-is
          }
          
          // Generate a fresh signed URL (2 hour expiry) for Supabase paths
          if (filename && !filename.startsWith("http")) {
            const { data: signedData, error: signedError } = await supabaseAdmin.storage
              .from("RotaSphere")
              .createSignedUrl(filename, 7200)
            
            if (!signedError && signedData) {
              screenshotUrl = signedData.signedUrl
              console.log("Signed URL:", screenshotUrl)
            }
          }
        } catch (err) {
          console.error("Failed to generate signed url for ticket:", err)
        }
      }

      return {
        id: t.id,
        eventTitle: eventTitlesMap[t.event_id] || "Unknown Event",
        eventId: t.event_id,
        ticketCode: t.ticket_code,
        pricePaid: t.price_paid,
        status: t.status || "active",
        createdAt: t.created_at || t.purchased_at,
        screenshotUrl: screenshotUrl,
        attendeeName: primaryAttendeeName,
        attendeeEmail: primaryAttendeeEmail,
        orderId: t.order_id,
        ticketTierId: t.ticket_tier_id,
        ticketTierName: t.ticket_tier_name
      }
    })

    const mapped = await Promise.all(mappedPromises)

    return { success: true, tickets: mapped, simulated: false }
  } catch (error) {
    console.error("Error in getOrganizerTicketsAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch organizer tickets" }
  }
}

export interface IssueManualTicketInput {
  eventId: string
  ticketCount: number
  primaryFullName: string
  primaryEmail: string
  primaryClubName?: string
  primaryDesignation?: string
  ticketTierName?: string
  paymentNote?: string
  guests?: Array<{
    fullName: string
    email: string
    clubName?: string
    designation?: string
  }>
}

export async function issueManualTicketAction(input: IssueManualTicketInput) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Unauthorized: Please log in." }
    }

    const caller = await getCallerProfile(userId)
    if (!caller) return { success: false, error: "Profile not found." }

    if (!input.eventId || !input.primaryFullName || !input.primaryEmail) {
      return { success: false, error: "Missing required fields (eventId, full name, email)." }
    }

    const count = Math.max(1, input.ticketCount || 1)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.eventId)

    if (!isSupabaseAdminConfigured || !isUuid) {
      const simulatedTickets = Array.from({ length: count }, (_, i) => ({
        id: `manual_sim_${Date.now()}_${i}`,
        ticketCode: `ORG-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        fullName: i === 0 ? input.primaryFullName : input.guests?.[i - 1]?.fullName || `${input.primaryFullName} Guest ${i}`,
        email: i === 0 ? input.primaryEmail : input.guests?.[i - 1]?.email || input.primaryEmail,
        clubName: i === 0 ? input.primaryClubName || "Rotaract" : input.guests?.[i - 1]?.clubName || input.primaryClubName || "Rotaract",
        designation: i === 0 ? input.primaryDesignation || "Member" : input.guests?.[i - 1]?.designation || input.primaryDesignation || "Member",
        tierName: input.ticketTierName || "Organizer Manual Pass",
        paymentNote: input.paymentNote || "Issued by Organizer"
      }))

      return {
        success: true,
        simulated: true,
        tickets: simulatedTickets
      }
    }

    // Fetch event from Supabase
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("id, organizer_id, capacity, attendees_count, title")
      .eq("id", input.eventId)
      .maybeSingle()

    if (fetchError || !event) {
      // If event not in DB, fallback to simulated issuance
      const simulatedTickets = Array.from({ length: count }, (_, i) => ({
        id: `manual_sim_${Date.now()}_${i}`,
        ticketCode: `ORG-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        fullName: i === 0 ? input.primaryFullName : input.guests?.[i - 1]?.fullName || `${input.primaryFullName} Guest ${i}`,
        email: i === 0 ? input.primaryEmail : input.guests?.[i - 1]?.email || input.primaryEmail,
        clubName: i === 0 ? input.primaryClubName || "Rotaract" : input.guests?.[i - 1]?.clubName || input.primaryClubName || "Rotaract",
        designation: i === 0 ? input.primaryDesignation || "Member" : input.guests?.[i - 1]?.designation || input.primaryDesignation || "Member",
        tierName: input.ticketTierName || "Organizer Manual Pass",
        paymentNote: input.paymentNote || "Issued by Organizer"
      }))

      return {
        success: true,
        simulated: true,
        tickets: simulatedTickets
      }
    }

    // Check authorization (must be organizer of event, matching email, or administrative role)
    if (
      event.organizer_id &&
      event.organizer_id !== userId &&
      event.organizer_id !== caller.email &&
      caller.role !== "ORGANIZER" &&
      caller.role !== "ADMIN" &&
      caller.role !== "SUPER_ADMIN"
    ) {
      return { success: false, error: "Unauthorized: You can only issue tickets for your own events." }
    }

    const currentCount = event.attendees_count || 0
    if (event.capacity && currentCount + count > event.capacity) {
      return { success: false, error: `Event capacity reached (${currentCount}/${event.capacity}). Cannot issue ${count} tickets.` }
    }

    // Build passes array
    const passesToCreate = Array.from({ length: count }, (_, i) => {
      const isPrimary = i === 0
      const guestObj = !isPrimary ? input.guests?.[i - 1] : undefined
      const fullName = isPrimary ? input.primaryFullName : guestObj?.fullName || `${input.primaryFullName} Guest ${i}`
      const email = isPrimary ? input.primaryEmail : guestObj?.email || input.primaryEmail
      const clubName = isPrimary ? input.primaryClubName || "" : guestObj?.clubName || input.primaryClubName || ""
      const designation = isPrimary ? input.primaryDesignation || "" : guestObj?.designation || input.primaryDesignation || ""

      return {
        ticketCode: `ORG-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        fullName,
        email,
        clubName,
        designation
      }
    })

    const createdTickets = []

    for (const pass of passesToCreate) {
      // Ensure exact pass email is preserved
      const passEmail = pass.email ? pass.email.trim() : input.primaryEmail ? input.primaryEmail.trim() : "attendee@rotasphere.org"

      // 1. Insert ticket record with schema fallback
      let ticketData: any = null
      const fullTicketRes = await supabaseAdmin
        .from("tickets")
        .insert({
          event_id: input.eventId,
          user_id: userId,
          user_email: passEmail,
          ticket_code: pass.ticketCode,
          price_paid: 0,
          status: "active",
          order_id: `manual_${Date.now()}_${pass.ticketCode}`,
          payment_id: input.paymentNote ? `manual:${input.paymentNote}` : "organizer_manual_issue",
          ticket_tier_name: input.ticketTierName || "Organizer Pass"
        })
        .select()
        .single()

      if (fullTicketRes.error) {
        console.warn("[issueManualTicketAction] Full ticket insert fallback triggered:", fullTicketRes.error.message)
        const coreTicketRes = await supabaseAdmin
          .from("tickets")
          .insert({
            event_id: input.eventId,
            user_id: userId,
            ticket_code: pass.ticketCode,
            price_paid: 0,
            status: "active",
            order_id: `manual_${Date.now()}_${pass.ticketCode}`,
            payment_id: input.paymentNote ? `manual:${input.paymentNote}` : "organizer_manual_issue"
          })
          .select()
          .single()

        if (coreTicketRes.error) throw coreTicketRes.error
        ticketData = coreTicketRes.data
      } else {
        ticketData = fullTicketRes.data
      }

      // 2. Insert attendee record with ticket_id link & exact email
      const manualClerkId = `manual_${pass.ticketCode}`
      const nowIso = new Date().toISOString()
      let { error: attendeeError } = await supabaseAdmin
        .from("attendees")
        .insert({
          event_id: input.eventId,
          clerk_id: manualClerkId,
          full_name: pass.fullName,
          email: passEmail,
          ticket_id: ticketData.id,
          club_name: pass.clubName,
          designation: pass.designation,
          status: "confirmed",
          registered_at: nowIso
        })

      // Fallback if status/registered_at or unique constraint fails
      if (attendeeError) {
        const fallbackClerkId = `manual_${pass.ticketCode}_${Date.now()}`
        const retryRes = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: input.eventId,
            clerk_id: fallbackClerkId,
            full_name: pass.fullName,
            email: passEmail,
            ticket_id: ticketData.id,
            club_name: pass.clubName,
            designation: pass.designation
          })
        attendeeError = retryRes.error
      }

      if (attendeeError) {
        console.warn("Attendee insert warning for manual ticket issue:", attendeeError.message)
      }

      // 3. Send email pass to attendee
      try {
        const emailHtml = `
          <div style="font-family: 'Inter', sans-serif; background-color: #041C32; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="font-family: 'Outfit', sans-serif; color: #38BDF8; font-size: 24px; margin-bottom: 20px;">🎟️ Event Pass Issued!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">Hello ${pass.fullName},</p>
            <p style="font-size: 16px; line-height: 1.6; color: #b8c2cc;">An event ticket pass has been manually issued for you for <strong>${event?.title || "Event Pass"}</strong>.</p>
            
            <div style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="margin-top: 0; color: #38BDF8; font-size: 14px; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace;">Ticket Details</h3>
              <p style="margin: 5px 0; color: #e2e8f0; font-size: 14px;"><strong>Ticket Code:</strong> #${pass.ticketCode}</p>
              <p style="margin: 5px 0; color: #e2e8f0; font-size: 14px;"><strong>Ticket Type:</strong> ${input.ticketTierName || "Organizer Pass"}</p>
              <p style="margin: 5px 0; color: #e2e8f0; font-size: 14px;"><strong>Club:</strong> ${pass.clubName || "Non-Rotaractor"}</p>
              <p style="margin: 5px 0; color: #e2e8f0; font-size: 14px;"><strong>Designation:</strong> ${pass.designation || "Member"}</p>
            </div>

            <p style="font-size: 14px; color: #94a3b8;">Please present this email or ticket code at the registration desk on the event day.</p>
            <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 30px 0;" />
            <span style="font-size: 12px; color: #64748b; display: block; text-align: center;">Rotaract District 3192 Platform Operations</span>
          </div>
        `

        await sendEmail({
          to: passEmail,
          subject: `🎟️ Your Event Pass for ${event?.title || "Event Pass"}`,
          html: emailHtml
        })
      } catch (eErr) {
        console.warn("Failed to send email pass to manual attendee:", eErr)
      }

      createdTickets.push({
        id: ticketData.id,
        ticketCode: pass.ticketCode,
        fullName: pass.fullName,
        email: passEmail,
        clubName: pass.clubName,
        designation: pass.designation,
        tierName: input.ticketTierName || "Organizer Pass"
      })
    }

    // Update attendees_count
    await supabaseAdmin
      .from("events")
      .update({ attendees_count: currentCount + count })
      .eq("id", input.eventId)

    await logEvent({
      userId,
      userEmail: caller.email,
      action: "MANUAL_TICKET_ISSUED",
      targetId: input.eventId,
      level: "INFO",
      details: { ticketCount: count, primaryEmail: input.primaryEmail }
    })

    return {
      success: true,
      simulated: false,
      tickets: createdTickets
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to issue tickets"
    console.error("[SERVER ACTION ERROR in issueManualTicketAction]:", error)
    await logEvent({
      action: "MANUAL_TICKET_ERROR",
      level: "ERROR",
      errorMsg,
      details: { errorStack: error instanceof Error ? error.stack : String(error), input }
    })
    return { success: false, error: errorMsg }
  }
}
