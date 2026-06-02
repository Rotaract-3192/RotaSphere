"use server"

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { clerkClient, auth } from "@clerk/nextjs/server"

const SUPER_ADMIN_EMAIL = "thejaswinp6@gmail.com"

export async function syncClerkUserAction(userData: {
  clerkId: string;
  email: string;
  fullName: string;
  imageUrl?: string;
}) {
  try {
    const isSuperAdmin = userData.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    if (!isSupabaseAdminConfigured) {
      console.warn("[Auth] Supabase not configured — simulating user sync.")
      return {
        success: true,
        simulated: true,
        role: isSuperAdmin ? ("admin" as const) : ("attendee" as const)
      }
    }

    // Determine role: super admin is always admin, otherwise keep existing or default to attendee
    let role: "attendee" | "organizer" | "admin" = isSuperAdmin ? "admin" : "attendee"

    if (!isSuperAdmin) {
      // Fetch existing role to preserve it
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userData.clerkId)
        .maybeSingle()

      if (existing?.role) {
        role = existing.role as "attendee" | "organizer" | "admin"
      }
    }

    // Single upsert — no double insert bug
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userData.clerkId,
          email: userData.email.toLowerCase(),
          full_name: userData.fullName,
          role,
          image_url: userData.imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (error) {
      console.error("[Auth] Profile upsert error:", error)
      // Don't throw — return a best-effort role
      return { success: true, role, simulated: false }
    }

    // Sync role to Clerk public metadata so frontend picks it up instantly
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(userData.clerkId, {
        publicMetadata: { role }
      })
    } catch (clerkErr) {
      console.warn("[Auth] Clerk metadata sync failed (non-fatal):", clerkErr)
    }

    return { success: true, role, simulated: false }
  } catch (error) {
    console.error("[Auth] syncClerkUserAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync user",
    }
  }
}

export async function updateUserRoleAction(clerkId: string, role: "attendee" | "organizer" | "admin") {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    // 1. Update Clerk metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: { role }
    })

    // 2. Update Supabase
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", clerkId)

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error("[Admin] updateUserRoleAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update role" }
  }
}

export async function getAdminDashboardDataAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!isSupabaseAdminConfigured) {
      // Simulated data when DB not set up
      return {
        success: true,
        simulated: true,
        users: [
          { id: "usr_1", email: "sophia@tech.io", full_name: "Sophia Martinez", role: "organizer", image_url: "" },
          { id: "usr_2", email: "dchen@gmail.com", full_name: "David Chen", role: "attendee", image_url: "" },
          { id: "usr_3", email: "alex@rivera.com", full_name: "Alex Rivera", role: "attendee", image_url: "" },
          { id: "usr_4", email: "sarah@rotasphere.com", full_name: "Sarah Jenkins", role: "admin", image_url: "" }
        ],
        usersCount: 124,
        eventsCount: 4,
        ticketsCount: 1240,
        commission: 124840
      }
    }

    // Verify caller is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) throw profileError
    if (profile?.role !== "admin") {
      return { success: false, error: "Unauthorized. Admin role required." }
    }

    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, image_url, created_at")
      .order("created_at", { ascending: false })

    if (profilesError) throw profilesError

    // Fetch events count
    const { count: eventsCount, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) throw eventsError

    // Fetch ticket stats & revenue
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("price_paid")

    if (ticketsError) throw ticketsError

    const ticketsCount = tickets?.length || 0
    const totalRevenue = tickets?.reduce((sum, t) => sum + Number(t.price_paid || 0), 0) || 0
    const commission = totalRevenue * 0.10

    return {
      success: true,
      simulated: false,
      users: (profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: p.role,
        image_url: p.image_url || ""
      })),
      usersCount: profiles?.length || 0,
      eventsCount: eventsCount || 0,
      ticketsCount,
      commission
    }
  } catch (error) {
    console.error("[Admin] getAdminDashboardDataAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch dashboard data" }
  }
}

export async function getUserTicketsAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    if (!isSupabaseAdminConfigured) {
      return { success: true, tickets: [], simulated: true }
    }

    const { data, error } = await supabaseAdmin
      .from("tickets")
      .select("*, event:events(title, start_date, venue_name, city, banner_url, category, type)")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })

    if (error) throw error

    return { success: true, tickets: data || [], simulated: false }
  } catch (error) {
    console.error("[User] getUserTicketsAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tickets" }
  }
}
