"use server"

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { mapRowToEventItem } from "@/lib/eventMapper"

export interface EventFormInput {
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  bannerUrl: string;
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  timezone: string;
  type: 'free' | 'paid';
  price?: string;
  visibility: 'public' | 'private';
  locationType: 'in-person' | 'online' | 'hybrid';
  venueName?: string;
  venueDescription?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  category: string;
  tags: string;
  capacity: number;
  contactEmail: string;
  contactPhone?: string;
  organizer: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

const SUPER_ADMIN_EMAIL = "tech.rotaract3192@gmail.com"

// Helper to log audit actions
async function logAuditAction(adminId: string, adminEmail: string, action: string, targetId: string, details: any) {
  try {
    if (isSupabaseAdminConfigured) {
      await supabaseAdmin.from("audit_logs").insert({
        user_id: adminId,
        user_email: adminEmail,
        action,
        target_id: targetId,
        details: details || {}
      })
    } else {
      console.log(`[Simulated Audit Log] Admin: ${adminEmail} (${adminId}), Action: ${action}, Target: ${targetId}, Details:`, details)
    }
  } catch (err) {
    console.error("[AuditLog] Error logging action:", err)
  }
}

// Normalize DB lowercase role → uppercase for code comparisons
function normalizeRole(role: string): string {
  return role.toUpperCase()
}
function normalizeStatus(status: string): string {
  return status.toUpperCase()
}
// Convert code uppercase role → lowercase for DB storage
function dbRole(role: string): string {
  return role.toLowerCase()
}
function dbStatus(status: string): string {
  return status.toLowerCase()
}

// Helper to resolve user roles/status
async function getCallerProfile(userId: string) {
  if (!isSupabaseAdminConfigured) {
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.primaryEmailAddress?.emailAddress || ""
      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      const rawRole = (clerkUser.publicMetadata?.role as string) || (isSuperAdmin ? "SUPER_ADMIN" : "PENDING_USER")
      const rawStatus = (clerkUser.publicMetadata?.status as string) || (isSuperAdmin ? "ACTIVE" : "PENDING")
      // Normalize to uppercase for consistent RBAC checks
      return { role: normalizeRole(rawRole), status: normalizeStatus(rawStatus), email }
    } catch (e) {
      return { role: "SUPER_ADMIN", status: "ACTIVE", email: SUPER_ADMIN_EMAIL }
    }
  }

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role, status, email")
    .eq("id", userId)
    .maybeSingle()

  if (error || !profile) {
    // FALLBACK: Auto-sync from Clerk if profile is missing in the database
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.primaryEmailAddress?.emailAddress || ""
      const fullName = clerkUser.fullName || clerkUser.username || "Event Enthusiast"
      const imageUrl = clerkUser.imageUrl

      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      // DB stores lowercase roles, code uses uppercase
      const roleForDb = isSuperAdmin ? "super_admin" : "pending_user"
      const statusForDb = isSuperAdmin ? "ACTIVE" : "PENDING"

      const { error: upsertError } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            id: userId,
            email: email.toLowerCase(),
            full_name: fullName,
            role: roleForDb,
            status: statusForDb,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )

      if (upsertError) {
        throw new Error(`Profile auto-sync failed: ${upsertError.message}`)
      }

      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { role: normalizeRole(roleForDb), status: normalizeStatus(statusForDb) }
        })
      } catch (clerkErr) {
        console.warn("[Auth] Clerk metadata update failed (non-fatal):", clerkErr)
      }

      // Return uppercase for code-level comparisons
      return { role: normalizeRole(roleForDb), status: normalizeStatus(statusForDb), email }
    } catch (fallbackErr: any) {
      console.error("[Auth] Auto-sync fallback failed:", fallbackErr)
      throw new Error(`Profile auto-sync failed: ${fallbackErr?.message || String(fallbackErr)}`)
    }
  }
  // Normalize DB lowercase → uppercase for consistent RBAC checks
  return {
    role: normalizeRole(profile.role),
    status: normalizeStatus(profile.status),
    email: profile.email
  }
}

export async function createEventAction(input: EventFormInput) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "You must be signed in to create events." }
    }

    // RBAC check: only ACTIVE, approved organizers or admins can create events
    const caller = await getCallerProfile(userId)
    if (!caller) {
      return { success: false, error: "User profile not found." }
    }

    if (caller.status !== "ACTIVE") {
      return { success: false, error: `Unauthorized. Your account status is: ${caller.status}. Only ACTIVE accounts can create events.` }
    }

    if (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN" && caller.role !== "ORGANIZER") {
      return { success: false, error: `Unauthorized. Your role (${caller.role}) does not have permission to create events.` }
    }

    const startD = new Date(input.startDate)
    const endD = new Date(input.endDate)
    const dateStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const timeStr = `${startD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${endD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${input.timezone}`
    const locStr = input.locationType === "online" ? "Virtual Online Link" : `${input.venueName}, ${input.city}`
    const priceVal = input.type === "free" ? 0 : parseFloat(input.price || "0")
    const tagsArr = input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    const priceStr = input.type === "free" ? "Free" : `₹${priceVal.toFixed(2)}`

    const simulatedEvent = {
      id: `evt-${Date.now()}`,
      title: input.title,
      description: input.description,
      date: dateStr,
      time: timeStr,
      location: locStr,
      image: input.bannerUrl,
      organizer: input.organizer,
      price: priceStr,
      category: input.category,
      capacity: String(input.capacity),
      attendees: 0,
      latitude: input.latitude,
      longitude: input.longitude,
      googleMapsUrl: input.googleMapsUrl,
      locationType: input.locationType,
      status: "DRAFT",
      reviewNotes: ""
    }

    if (!isSupabaseAdminConfigured) {
      console.warn("Supabase Admin is not configured. Simulating event save.")
      return { 
        success: true, 
        event: simulatedEvent,
        simulated: true 
      }
    }

    // Fetch user name to set as organizer label
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle()
    
    const organizerName = profile?.full_name || input.organizer || "Event Organizer"

    // Insert into Supabase with default status DRAFT
    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        title: input.title,
        slug: input.slug || `evt-${Date.now()}`,
        description: input.description,
        full_description: input.fullDescription,
        banner_url: input.bannerUrl,
        thumbnail_url: input.thumbnailUrl || input.bannerUrl,
        start_date: startD.toISOString(),
        end_date: endD.toISOString(),
        timezone: input.timezone,
        type: input.type,
        price: priceVal,
        visibility: input.visibility,
        location_type: input.locationType,
        venue_name: input.venueName,
        venue_description: input.venueDescription,
        country: input.country,
        state: input.state,
        city: input.city,
        address: input.address,
        pincode: input.pincode,
        google_maps_url: input.googleMapsUrl,
        latitude: input.latitude,
        longitude: input.longitude,
        category: input.category,
        tags: tagsArr,
        capacity: Number(input.capacity),
        contact_email: input.contactEmail,
        contact_phone: input.contactPhone,
        organizer: organizerName,
        organizer_id: userId,
        attendees_count: 0,
        status: "DRAFT",
        review_notes: null
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const mapped = mapRowToEventItem(data)

    return { 
      success: true, 
      event: mapped,
      simulated: false
    }
  } catch (error: any) {
    const errorMsg = error?.message || (typeof error === 'string' ? error : "Failed to create event")
    console.error("Failed to create event in Supabase:", error)
    return { success: false, error: errorMsg }
  }
}

export async function submitEventForApprovalAction(eventId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller) return { success: false, error: "Profile not found." }

    if (!isSupabaseAdminConfigured) {
      return { success: true, simulated: true }
    }

    // Check if event exists and caller is owner or admin
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .maybeSingle()

    if (fetchError || !event) {
      return { success: false, error: "Event not found" }
    }

    if (event.organizer_id !== userId && caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN") {
      return { success: false, error: "Unauthorized to submit this event." }
    }

    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({
        status: "PENDING_APPROVAL"
      })
      .eq("id", eventId)

    if (updateError) throw updateError

    return { success: true }
  } catch (error) {
    console.error("Error submitting event for approval:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to submit event" }
  }
}

export async function reviewEventAction(eventId: string, action: 'approve' | 'reject' | 'request_changes', notes?: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    if (!isSupabaseAdminConfigured) {
      return { success: true, simulated: true }
    }

    let status: 'PUBLISHED' | 'REJECTED' | 'DRAFT'
    if (action === 'approve') {
      status = 'PUBLISHED'
    } else if (action === 'reject') {
      status = 'REJECTED'
    } else {
      // request changes reverts to draft
      status = 'DRAFT'
    }

    const updatePayload: any = { status }
    if (action === 'request_changes') {
      updatePayload.review_notes = notes || ''
    } else {
      updatePayload.review_notes = null
    }

    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update(updatePayload)
      .eq("id", eventId)

    if (updateError) throw updateError

    // Write audit log
    await logAuditAction(userId, caller.email || "", "REVIEW_EVENT", eventId, { action, notes })

    return { success: true }
  } catch (error) {
    console.error("Error in reviewEventAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to review event" }
  }
}

export async function getEventsAction() {
  try {
    const { userId } = await auth()
    let callerRole: string | null = null

    if (userId) {
      const caller = await getCallerProfile(userId)
      if (caller) callerRole = caller.role
    }

    if (!isSupabaseAdminConfigured) {
      // Return filtered mock events
      const mockEvents = [
        {
          id: "evt-mock-1",
          title: "Beach Cleanup Campaign",
          description: "Help clean up our local beach!",
          fullDescription: "Join us for a morning of environmental service followed by beach volleyball and lunch.",
          bannerUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&auto=format&fit=crop&q=80",
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 96400000).toISOString(),
          timezone: "IST",
          type: "free" as const,
          price: 0,
          visibility: "public" as const,
          locationType: "in-person" as const,
          venueName: "Besant Nagar Beach",
          city: "Chennai",
          organizer: "Rotaract Club of Chennai",
          organizer_id: "usr_1",
          status: "PUBLISHED",
          latitude: 13.0012,
          longitude: 80.2707,
          category: "Community Service",
          review_notes: ""
        },
        {
          id: "evt-mock-2",
          title: "District Leadership Seminar",
          description: "Annual leadership training.",
          fullDescription: "Empowering young leaders with essential communication, coordination, and team management skills.",
          bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
          startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 3 + 18000 * 1000).toISOString(),
          timezone: "IST",
          type: "paid" as const,
          price: 150,
          visibility: "public" as const,
          locationType: "in-person" as const,
          venueName: "District Hall",
          city: "Bangalore",
          organizer: "Sarah Jenkins",
          organizer_id: "usr_4",
          status: "PENDING_APPROVAL",
          latitude: 12.9716,
          longitude: 77.5946,
          category: "Professional Development",
          review_notes: ""
        },
        {
          id: "evt-mock-3",
          title: "Ocean Wave Art Workshop",
          description: "Paint beautiful ocean landscapes.",
          fullDescription: "An art workshop celebrating the beauty of the ocean with resin and acrylic paints.",
          bannerUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
          thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
          startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          endDate: new Date(Date.now() + 86400000 * 5 + 10000 * 1000).toISOString(),
          timezone: "IST",
          type: "free" as const,
          price: 0,
          visibility: "public" as const,
          locationType: "online" as const,
          organizer: "Sophia Martinez",
          organizer_id: "usr_1",
          status: "DRAFT",
          category: "Arts & Culture",
          review_notes: "Please add a detailed outline of the artwork materials."
        }
      ]

      const filtered = mockEvents.filter(evt => {
        if (!userId) return evt.status === "PUBLISHED"
        if (callerRole === "SUPER_ADMIN" || callerRole === "ADMIN") return true
        if (callerRole === "ORGANIZER") return evt.status === "PUBLISHED" || evt.organizer_id === userId
        return evt.status === "PUBLISHED"
      })

      const mapped = filtered.map(mapRowToEventItem)
      return { success: true, events: mapped, simulated: true }
    }

    // Build Supabase Query
    let query = supabaseAdmin.from("events").select("*")

    // Filter query based on role
    if (callerRole !== "SUPER_ADMIN" && callerRole !== "ADMIN") {
      if (callerRole === "ORGANIZER") {
        query = query.or(`status.eq.PUBLISHED,organizer_id.eq.${userId}`)
      } else {
        query = query.eq("status", "PUBLISHED")
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    const mapped = (data || []).map(mapRowToEventItem)

    return { success: true, events: mapped, simulated: false }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch events"
    console.error("Failed to fetch events from Supabase:", error)
    return { success: false, error: errorMsg }
  }
}

export async function deleteEventAction(id: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const caller = await getCallerProfile(userId)
    if (!caller) return { success: false, error: "Profile not found." }

    if (!isSupabaseAdminConfigured) {
      return { success: true, simulated: true }
    }

    // Check if the user is authorized to delete the event (must be organizer or admin)
    const { data: event, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("organizer_id")
      .eq("id", id)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!event) {
      return { success: false, error: "Event not found" }
    }

    if (event.organizer_id !== userId && caller.role !== "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized: You did not create this event and do not have administrative permissions." }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)

    if (deleteError) throw deleteError

    // Write audit log
    await logAuditAction(userId, caller.email || "", "DELETE_EVENT", id, {})

    return { success: true, simulated: false }
  } catch (error) {
    console.error("Error in deleteEventAction:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete event" }
  }
}

export async function getPlatformStatsAction() {
  try {
    if (!isSupabaseAdminConfigured) {
      return {
        success: true,
        simulated: true,
        eventsCount: 12400,
        ticketsCount: 450000,
        uptime: "99.9%",
        rating: "4.9/5"
      }
    }

    // Count events in the DB
    const { count: dbEventsCount, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) throw eventsError

    // Count tickets in the DB
    const { count: dbTicketsCount, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("*", { count: "exact", head: true })

    if (ticketsError) throw ticketsError

    return {
      success: true,
      simulated: false,
      eventsCount: dbEventsCount || 0,
      ticketsCount: dbTicketsCount || 0,
      uptime: "99.9%",
      rating: "4.9/5"
    }
  } catch (error) {
    console.error("Error in getPlatformStatsAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stats",
      simulated: true,
      eventsCount: 12400,
      ticketsCount: 450000,
      uptime: "99.9%",
      rating: "4.9/5"
    }
  }
}

export async function getHeroFeaturedEventAction() {
  try {
    if (!isSupabaseAdminConfigured) {
      return {
        success: true,
        simulated: true,
        event: {
          title: "NextGen Tech Summit",
          organizer: "RotaSphere Pro",
          ticketsSold: 1240,
          capacity: 1500,
          revenue: "$370,760",
          recentRegistrations: [
            { name: "Sophia Martinez", type: "VIP Ticket", time: "2m ago" },
            { name: "David Chen", type: "Regular", time: "12m ago" },
            { name: "Emily Watson", type: "VIP Ticket", time: "25m ago" }
          ]
        }
      }
    }

    // Fetch the most popular event that is PUBLISHED
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("attendees_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (eventError) throw eventError

    if (!event) {
      // Fallback if DB is connected but empty
      return {
        success: true,
        simulated: false,
        event: null
      }
    }

    // Fetch latest 3 registrations for this event
    const { data: attendees, error: attendeesError } = await supabaseAdmin
      .from("attendees")
      .select("full_name, registered_at")
      .eq("event_id", event.id)
      .order("registered_at", { ascending: false })
      .limit(3)

    if (attendeesError) throw attendeesError

    const price = parseFloat(String(event.price || 0))
    const totalRev = price * (event.attendees_count || 0)
    const currencySymbol = String(event.price).startsWith("₹") ? "₹" : "$"
    const formattedRevenue = event.type === "free" ? "Free" : `${currencySymbol}${totalRev.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

    const mappedRegistrations = (attendees || []).map(att => {
      const msAgo = Date.now() - new Date(att.registered_at).getTime()
      const minAgo = Math.max(1, Math.round(msAgo / 1000 / 60))
      const timeStr = minAgo > 60 
        ? `${Math.round(minAgo / 60)}h ago` 
        : `${minAgo}m ago`

      return {
        name: att.full_name,
        type: event.type === "free" ? "Free Pass" : "Registered",
        time: timeStr
      }
    })

    return {
      success: true,
      simulated: false,
      event: {
        title: event.title,
        organizer: event.organizer || "Event Organizer",
        ticketsSold: event.attendees_count || 0,
        capacity: event.capacity || 500,
        revenue: formattedRevenue,
        recentRegistrations: mappedRegistrations
      }
    }
  } catch (error) {
    console.error("Error in getHeroFeaturedEventAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch featured event",
      simulated: true,
      event: {
        title: "NextGen Tech Summit",
        organizer: "RotaSphere Pro",
        ticketsSold: 1240,
        capacity: 1500,
        revenue: "$370,760",
        recentRegistrations: [
          { name: "Sophia Martinez", type: "VIP Ticket", time: "2m ago" },
          { name: "David Chen", type: "Regular", time: "12m ago" },
          { name: "Emily Watson", type: "VIP Ticket", time: "25m ago" }
        ]
      }
    }
  }
}

export async function resolveGoogleMapsUrlAction(url: string) {
  try {
    if (!url) return { success: false, error: "Empty URL" }
    
    // Check if it's a shortened Google Maps URL
    if (url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps")) {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        redirect: "follow"
      })
      const resolvedUrl = response.url
      return { success: true, resolvedUrl }
    }
    return { success: true, resolvedUrl: url }
  } catch (err) {
    console.error("Error resolving Google Maps URL:", err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to resolve URL" }
  }
}
