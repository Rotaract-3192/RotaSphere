"use server"

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { auth } from "@clerk/nextjs/server"
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



export async function createEventAction(input: EventFormInput) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return { success: false, error: "You must be signed in to create events." }
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
      locationType: input.locationType
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

    // Insert into Supabase
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
        attendees_count: 0
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
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create event"
    console.error("Failed to create event in Supabase:", error)
    return { success: false, error: errorMsg }
  }
}

export async function getEventsAction() {
  try {
    if (!isSupabaseAdminConfigured) {
      return { success: true, events: [], simulated: true }
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

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

    if (event.organizer_id !== userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()
      
      if (profile?.role !== "admin") {
        return { success: false, error: "Unauthorized: You did not create this event." }
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("events")
      .delete()
      .eq("id", id)

    if (deleteError) throw deleteError

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

    // Fetch the most popular event (highest attendees count)
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
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


