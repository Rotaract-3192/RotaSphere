"use server"

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { auth, currentUser } from "@clerk/nextjs/server"
import Razorpay from "razorpay"
import crypto from "crypto"
import { mapRowToEventItem } from "@/lib/eventMapper"

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

export async function verifyPaymentAndBookTicketAction(input: {
  eventId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  isSimulated?: boolean;
  ticketCount?: number;
  fullName?: string;
  email?: string;
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

    for (let i = 0; i < ticketCount; i++) {
      const ticketCode = generateTicketCode()
      const { data: ticket, error: ticketError } = await supabaseAdmin
        .from("tickets")
        .insert({
          event_id: input.eventId,
          user_id: userId,
          ticket_code: ticketCode,
          price_paid: event.price,
          status: "active",
          payment_id: input.paymentId,
          order_id: input.orderId
        })
        .select()
        .single()

      if (ticketError) throw ticketError
      createdTickets.push(ticket)

      if (i === 0) {
        primaryTicketId = ticket.id

        // Create attendee registration
        const { error: attendeeError } = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: input.eventId,
            clerk_id: userId,
            email: formEmail,
            full_name: formFullName,
            ticket_id: ticket.id
          })

        if (attendeeError) {
          // Rollback tickets
          for (const t of createdTickets) {
            await supabaseAdmin.from("tickets").delete().eq("id", t.id)
          }
          return { success: false, error: "You are already registered for this event." }
        }
      }
    }

    // Increment attendee count by ticketCount
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({
        attendees_count: (event.attendees_count || 0) + ticketCount,
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

export async function bookFreeTicketAction(eventId: string, ticketCount: number = 1, fullName?: string, email?: string) {
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

        // Create attendee registration
        const { error: attendeeError } = await supabaseAdmin
          .from("attendees")
          .insert({
            event_id: eventId,
            clerk_id: userId,
            email: formEmail,
            full_name: formFullName,
            ticket_id: ticket.id
          })

        if (attendeeError) {
          // Rollback tickets
          for (const t of createdTickets) {
            await supabaseAdmin.from("tickets").delete().eq("id", t.id)
          }
          return { success: false, error: "You are already registered for this event." }
        }
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
