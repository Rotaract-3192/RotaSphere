"use server"

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin"
import { clerkClient, auth } from "@clerk/nextjs/server"

const SUPER_ADMIN_EMAIL = "tech.rotaract3192@gmail.com"

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'PENDING_USER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

// DB stores roles/statuses as lowercase; code uses uppercase.
// These helpers ensure consistent conversion.
function normalizeRole(role: string): UserRole {
  return role.toUpperCase() as UserRole
}
function normalizeStatus(status: string): UserStatus {
  return status.toUpperCase() as UserStatus
}
function dbRole(role: string): string {
  return role.toLowerCase()
}
function dbStatus(status: string): string {
  return status.toLowerCase()
}


// Helper to log audit trails
async function logAuditAction(adminId: string, adminEmail: string, action: string, targetId: string, details: any) {
  try {
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin.from("audit_logs").insert({
        user_id: adminId,
        user_email: adminEmail,
        action,
        target_id: targetId,
        details: details || {}
      })
      if (error) {
        console.error("[AuditLog] Failed to insert into Supabase:", error)
      }
    } else {
      console.log(`[Simulated Audit Log] Admin: ${adminEmail} (${adminId}), Action: ${action}, Target: ${targetId}, Details:`, details)
    }
  } catch (err) {
    console.error("[AuditLog] Error logging action:", err)
  }
}

// Helper to check the caller's role/status
async function getCallerProfile(userId: string) {
  if (!isSupabaseAdminConfigured) {
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.primaryEmailAddress?.emailAddress || ""
      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      const rawRole = (clerkUser.publicMetadata?.role as string) || (isSuperAdmin ? "SUPER_ADMIN" : "ATTENDEE")
      const rawStatus = (clerkUser.publicMetadata?.status as string) || (isSuperAdmin ? "ACTIVE" : "ACTIVE")
      const rawBio = (clerkUser.publicMetadata?.bio as string) || ""
      const rawHomeClub = (clerkUser.publicMetadata?.homeClub as string) || ""
      return { 
        role: normalizeRole(rawRole), 
        status: normalizeStatus(rawStatus), 
        email,
        bio: rawBio,
        homeClub: rawHomeClub
      }
    } catch (e) {
      return { role: "SUPER_ADMIN" as UserRole, status: "ACTIVE" as UserStatus, email: SUPER_ADMIN_EMAIL, bio: "", homeClub: "" }
    }
  }

  let profile: any = null
  let error: any = null

  // Safely try to select role, status, email, bio, and home_club
  const { data: fullProfile, error: fullError } = await supabaseAdmin
    .from("profiles")
    .select("role, status, email, bio, home_club")
    .eq("id", userId)
    .maybeSingle()

  if (fullError) {
    // Fallback: select only role, status, email in case migration hasn't run
    const { data: fallbackProfile, error: fallbackError } = await supabaseAdmin
      .from("profiles")
      .select("role, status, email")
      .eq("id", userId)
      .maybeSingle()
    
    if (!fallbackError && fallbackProfile) {
      profile = fallbackProfile
    } else {
      error = fallbackError || new Error("Profile not found")
    }
  } else {
    profile = fullProfile
  }

  if (error || !profile) {
    // FALLBACK: Auto-sync from Clerk if profile is missing in the database
    try {
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      const email = clerkUser.primaryEmailAddress?.emailAddress || ""
      const fullName = clerkUser.fullName || clerkUser.username || "Event Enthusiast"
      const imageUrl = clerkUser.imageUrl

      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
      // Write lowercase to DB (check constraint requirement)
      const roleForDb = isSuperAdmin ? "super_admin" : "attendee"
      const statusForDb = isSuperAdmin ? "ACTIVE" : "ACTIVE"

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

      const normalizedRole = normalizeRole(roleForDb)
      const normalizedStatus = normalizeStatus(statusForDb)

      try {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { role: normalizedRole, status: normalizedStatus }
        })
      } catch (clerkErr) {
        console.warn("[Auth] Clerk metadata update failed (non-fatal):", clerkErr)
      }

      return { 
        role: normalizedRole, 
        status: normalizedStatus, 
        email, 
        bio: "", 
        homeClub: "" 
      }
    } catch (fallbackErr) {
      console.error("[Auth] Auto-sync fallback failed:", fallbackErr)
      return null
    }
  }
  // Normalize DB lowercase → uppercase for RBAC comparisons
  return {
    role: normalizeRole(profile.role),
    status: normalizeStatus(profile.status),
    email: profile.email,
    bio: profile.bio || "",
    homeClub: profile.home_club || ""
  }
}


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
      const role: UserRole = isSuperAdmin ? "SUPER_ADMIN" : "ATTENDEE"
      const status: UserStatus = isSuperAdmin ? "ACTIVE" : "ACTIVE"
      return {
        success: true,
        simulated: true,
        role,
        status,
        bio: "",
        homeClub: ""
      }
    }

    // Determine role and status: super admin is always active SUPER_ADMIN
    // DB uses lowercase roles; code uses uppercase
    let roleForDb = isSuperAdmin ? "super_admin" : "attendee"
    let statusForDb = isSuperAdmin ? "ACTIVE" : "ACTIVE"
    let existingBio = ""
    let existingHomeClub = ""

    if (!isSuperAdmin) {
      // Safely fetch existing role, status, bio, and home_club
      const { data: existing, error: selectError } = await supabaseAdmin
        .from("profiles")
        .select("role, status, bio, home_club")
        .eq("id", userData.clerkId)
        .maybeSingle()

      if (selectError) {
        // Fallback in case columns do not exist yet
        const { data: fallbackExisting } = await supabaseAdmin
          .from("profiles")
          .select("role, status")
          .eq("id", userData.clerkId)
          .maybeSingle()
        if (fallbackExisting) {
          if (fallbackExisting.role) roleForDb = fallbackExisting.role
          if (fallbackExisting.status) statusForDb = fallbackExisting.status
        }
      } else if (existing) {
        if (existing.role) roleForDb = existing.role
        if (existing.status) statusForDb = existing.status
        if (existing.bio) existingBio = existing.bio
        if (existing.home_club) existingHomeClub = existing.home_club
      }
    } else {
      // Fetch super admin bio/home_club if they exist
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("bio, home_club")
        .eq("id", userData.clerkId)
        .maybeSingle()
      if (existing) {
        if (existing.bio) existingBio = existing.bio
        if (existing.home_club) existingHomeClub = existing.home_club
      }
    }

    // Single upsert with lowercase role (check constraint requires it)
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userData.clerkId,
          email: userData.email.toLowerCase(),
          full_name: userData.fullName,
          role: roleForDb,
          status: statusForDb,
          image_url: userData.imageUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )

    if (error) {
      console.error("[Auth] Profile upsert error:", error)
      // Return normalized role even if upsert failed
      return { 
        success: true, 
        role: normalizeRole(roleForDb), 
        status: normalizeStatus(statusForDb), 
        bio: existingBio,
        homeClub: existingHomeClub,
        simulated: false 
      }
    }

    const role = normalizeRole(roleForDb)
    const status = normalizeStatus(statusForDb)

    // Sync role & status to Clerk public metadata (uppercase)
    try {
      const client = await clerkClient()
      await client.users.updateUserMetadata(userData.clerkId, {
        publicMetadata: { role, status, bio: existingBio, homeClub: existingHomeClub }
      })
    } catch (clerkErr) {
      console.warn("[Auth] Clerk metadata sync failed (non-fatal):", clerkErr)
    }

    return { 
      success: true, 
      role, 
      status, 
      bio: existingBio,
      homeClub: existingHomeClub,
      simulated: false 
    }
  } catch (error) {
    console.error("[Auth] syncClerkUserAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync user",
    }
  }
}


export async function approveUserAction(targetClerkId: string, role: UserRole) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    // Restrictions:
    // 1. Only SUPER_ADMIN can assign ADMIN role
    if (role === "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admins can assign the Admin role." }
    }
    // 2. Cannot assign SUPER_ADMIN role manually
    if (role === "SUPER_ADMIN") {
      return { success: false, error: "Cannot assign Super Admin role." }
    }

    // Update Clerk Metadata (uppercase for metadata)
    const client = await clerkClient()
    await client.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { role, status: "ACTIVE" as UserStatus }
    })

    // Update Database (lowercase for DB check constraint)
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          role: dbRole(role),
          status: "ACTIVE",
          updated_at: new Date().toISOString()
        })
        .eq("id", targetClerkId)

      if (error) throw error
    }

    // Write audit log
    await logAuditAction(userId, caller.email || "", "APPROVE_USER", targetClerkId, { approvedRole: role })

    return { success: true }
  } catch (error) {
    console.error("[Admin] approveUserAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to approve user" }
  }
}

export async function rejectUserAction(targetClerkId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    // Update Clerk Metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { status: "REJECTED" as UserStatus }
    })

    // Update Database (lowercase for DB check constraint)
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          status: "REJECTED",
          updated_at: new Date().toISOString()
        })
        .eq("id", targetClerkId)

      if (error) throw error
    }

    // Write audit log
    await logAuditAction(userId, caller.email || "", "REJECT_USER", targetClerkId, {})

    return { success: true }
  } catch (error) {
    console.error("[Admin] rejectUserAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to reject user" }
  }
}

export async function changeUserRoleAction(targetClerkId: string, role: UserRole) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    // Verify existing target role to check if caller is allowed to modify it
    let targetCurrentRole: UserRole = "PENDING_USER"
    if (isSupabaseAdminConfigured) {
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", targetClerkId)
        .maybeSingle()
      if (targetProfile) {
        // Normalize DB lowercase → uppercase for RBAC comparisons
        targetCurrentRole = normalizeRole(targetProfile.role)
      }
    } else {
      // In simulation mode, check Clerk if possible
      try {
        const client = await clerkClient()
        const clerkUser = await client.users.getUser(targetClerkId)
        targetCurrentRole = (clerkUser.publicMetadata?.role as UserRole) || "PENDING_USER"
      } catch (e) {}
    }

    // Restrictions:
    // 1. Only SUPER_ADMIN can assign ADMIN
    if (role === "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admins can assign the Admin role." }
    }
    // 2. Only SUPER_ADMIN can modify an existing ADMIN's role
    if (targetCurrentRole === "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admins can modify Admin accounts." }
    }
    // 3. No one can assign SUPER_ADMIN
    if (role === "SUPER_ADMIN") {
      return { success: false, error: "Cannot assign Super Admin role manually." }
    }
    // 4. Cannot modify a SUPER_ADMIN
    if (targetCurrentRole === "SUPER_ADMIN") {
      return { success: false, error: "Super Admin accounts cannot be modified." }
    }

    // Update Clerk Metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { role }
    })

    // Update Database (lowercase for DB check constraint)
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          role: dbRole(role),
          updated_at: new Date().toISOString()
        })
        .eq("id", targetClerkId)

      if (error) throw error
    }

    // Write audit log
    await logAuditAction(userId, caller.email || "", "ROLE_CHANGE", targetClerkId, { newRole: role, previousRole: targetCurrentRole })

    return { success: true }
  } catch (error) {
    console.error("[Admin] changeUserRoleAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to change user role" }
  }
}

export async function suspendUserAction(targetClerkId: string) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    // Verify existing target role
    let targetCurrentRole: UserRole = "PENDING_USER"
    if (isSupabaseAdminConfigured) {
      const { data: targetProfile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", targetClerkId)
        .maybeSingle()
      if (targetProfile) {
        // Normalize DB lowercase → uppercase for RBAC comparisons
        targetCurrentRole = normalizeRole(targetProfile.role)
      }
    }

    // Restrictions:
    // 1. Only SUPER_ADMIN can suspend an ADMIN
    if (targetCurrentRole === "ADMIN" && caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admins can suspend Admin accounts." }
    }
    // 2. Cannot suspend a SUPER_ADMIN
    if (targetCurrentRole === "SUPER_ADMIN") {
      return { success: false, error: "Super Admin accounts cannot be suspended." }
    }

    // Update Clerk Metadata
    const client = await clerkClient()
    await client.users.updateUserMetadata(targetClerkId, {
      publicMetadata: { status: "SUSPENDED" as UserStatus }
    })

    // Update Database (lowercase for DB check constraint)
    if (isSupabaseAdminConfigured) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          status: "SUSPENDED",
          updated_at: new Date().toISOString()
        })
        .eq("id", targetClerkId)

      if (error) throw error
    }

    // Write audit log
    await logAuditAction(userId, caller.email || "", "SUSPEND_USER", targetClerkId, {})

    return { success: true }
  } catch (error) {
    console.error("[Admin] suspendUserAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to suspend user" }
  }
}

export async function getAuditLogsAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || caller.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized. Super Admin role required." }
    }

    if (!isSupabaseAdminConfigured) {
      // Return simulated audit logs
      return {
        success: true,
        simulated: true,
        auditLogs: [
          {
            id: "log_1",
            user_id: "usr_super",
            user_email: SUPER_ADMIN_EMAIL,
            action: "APPROVE_USER",
            target_id: "usr_mock_1",
            details: { approvedRole: "ORGANIZER" },
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "log_2",
            user_id: "usr_super",
            user_email: SUPER_ADMIN_EMAIL,
            action: "ROLE_CHANGE",
            target_id: "usr_mock_2",
            details: { newRole: "ADMIN" },
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      }
    }

    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw error

    return {
      success: true,
      simulated: false,
      auditLogs: data || []
    }
  } catch (error) {
    console.error("[Admin] getAuditLogsAction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch audit logs" }
  }
}

export async function getAdminDashboardDataAction() {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller || (caller.role !== "SUPER_ADMIN" && caller.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized. Administrative privileges required." }
    }

    if (!isSupabaseAdminConfigured) {
      // Simulated data when DB not set up
      return {
        success: true,
        simulated: true,
        users: [
          { id: "usr_1", email: "sophia@tech.io", full_name: "Sophia Martinez", role: "ORGANIZER" as UserRole, status: "ACTIVE" as UserStatus, image_url: "" },
          { id: "usr_2", email: "dchen@gmail.com", full_name: "David Chen", role: "ATTENDEE" as UserRole, status: "ACTIVE" as UserStatus, image_url: "" },
          { id: "usr_3", email: "alex@rivera.com", full_name: "Alex Rivera", role: "PENDING_USER" as UserRole, status: "PENDING" as UserStatus, image_url: "" },
          { id: "usr_4", email: "sarah@rotasphere.com", full_name: "Sarah Jenkins", role: "ADMIN" as UserRole, status: "ACTIVE" as UserStatus, image_url: "" }
        ],
        usersCount: 4,
        eventsCount: 4,
        ticketsCount: 120,
        commission: 1240,
        salesByDay: [
          { day: "Mon", amount: 120 },
          { day: "Tue", amount: 240 },
          { day: "Wed", amount: 180 },
          { day: "Thu", amount: 450 },
          { day: "Fri", amount: 390 },
          { day: "Sat", amount: 600 },
          { day: "Sun", amount: 540 }
        ]
      }
    }

    // Fetch all profiles safely
    let profiles: any[] = []
    const { data: fullProfiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, status, image_url, bio, home_club, created_at")
      .order("created_at", { ascending: false })

    if (profilesError) {
      const { data: fallbackProfiles, error: fallbackError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, role, status, image_url, created_at")
        .order("created_at", { ascending: false })
      if (fallbackError) throw fallbackError
      profiles = fallbackProfiles || []
    } else {
      profiles = fullProfiles || []
    }

    // Fetch events count
    const { count: eventsCount, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("*", { count: "exact", head: true })

    if (eventsError) throw eventsError

    // Fetch ticket stats & revenue
    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from("tickets")
      .select("price_paid, purchased_at")

    if (ticketsError) throw ticketsError

    const ticketsCount = tickets?.length || 0
    const totalRevenue = tickets?.reduce((sum, t) => sum + Number(t.price_paid || 0), 0) || 0
    const commission = totalRevenue * 0.10

    // Compute real daily sales by day of the week
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const salesSum = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
    
    ;(tickets || []).forEach((t: any) => {
      const dateVal = t.purchased_at || t.created_at
      if (dateVal) {
        const d = new Date(dateVal)
        const dayName = daysOfWeek[d.getDay()]
        if (dayName in salesSum) {
          salesSum[dayName as keyof typeof salesSum] += Number(t.price_paid || 0)
        }
      }
    })

    const salesByDay = [
      { day: "Mon", amount: salesSum.Mon },
      { day: "Tue", amount: salesSum.Tue },
      { day: "Wed", amount: salesSum.Wed },
      { day: "Thu", amount: salesSum.Thu },
      { day: "Fri", amount: salesSum.Fri },
      { day: "Sat", amount: salesSum.Sat },
      { day: "Sun", amount: salesSum.Sun }
    ]

    return {
      success: true,
      simulated: false,
      users: (profiles || []).map(p => ({
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        role: normalizeRole(p.role || "pending_user"),
        status: normalizeStatus(p.status || "pending"),
        image_url: p.image_url || "",
        bio: p.bio || "",
        home_club: p.home_club || ""
      })),
      usersCount: profiles?.length || 0,
      eventsCount: eventsCount || 0,
      ticketsCount,
      commission,
      salesByDay
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

export async function updateUserProfileAction(profileData: {
  fullName: string;
  email: string;
  imageUrl?: string;
  bio?: string;
  homeClub?: string;
  role?: UserRole;
}) {
  try {
    const { userId } = await auth()
    if (!userId) return { success: false, error: "Unauthorized" }

    const caller = await getCallerProfile(userId)
    if (!caller) return { success: false, error: "Profile not found." }

    // Security check: regular users cannot make themselves ADMIN or SUPER_ADMIN
    if (profileData.role && (profileData.role === "ADMIN" || profileData.role === "SUPER_ADMIN")) {
      if (caller.role !== "SUPER_ADMIN") {
        return { success: false, error: "Unauthorized to assign administrative roles." }
      }
    }

    const roleToSet = profileData.role || caller.role
    const dbRoleVal = roleToSet.toLowerCase()

    // Determine status: if role changed to ORGANIZER and current is ATTENDEE, status becomes PENDING for approval
    let newStatus = caller.status
    if (roleToSet === "ORGANIZER" && caller.role === "ATTENDEE") {
      newStatus = "PENDING"
    }

    if (!isSupabaseAdminConfigured) {
      // Simulation mode
      return {
        success: true,
        simulated: true,
        user: {
          id: userId,
          email: profileData.email,
          fullName: profileData.fullName,
          role: roleToSet,
          status: newStatus,
          imageUrl: profileData.imageUrl || "",
          bio: profileData.bio || "",
          homeClub: profileData.homeClub || ""
        }
      }
    }

    // Update Supabase profiles table
    const updatePayload: any = {
      full_name: profileData.fullName,
      email: profileData.email.toLowerCase(),
      role: dbRoleVal,
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    if (profileData.imageUrl) {
      updatePayload.image_url = profileData.imageUrl
    }

    // Try updating everything including bio and home_club
    const fullPayload = {
      ...updatePayload,
      bio: profileData.bio || "",
      home_club: profileData.homeClub || ""
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(fullPayload)
      .eq("id", userId)

    if (updateError) {
      console.warn("[Auth] Failed to update full profile. Retrying with basic fields (migration may be missing).", updateError)
      // Retry without bio and home_club
      const { error: fallbackUpdateError } = await supabaseAdmin
        .from("profiles")
        .update(updatePayload)
        .eq("id", userId)

      if (fallbackUpdateError) {
        throw fallbackUpdateError
      }
    }

    // Sync to Clerk user profile if Clerk is active
    try {
      const client = await clerkClient()
      
      const updateData: any = {
        firstName: profileData.fullName.split(" ")[0] || "",
        lastName: profileData.fullName.split(" ").slice(1).join(" ") || "",
      }

      await client.users.updateUser(userId, updateData)

      // Update Clerk publicMetadata
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: roleToSet,
          status: newStatus,
          bio: profileData.bio || "",
          homeClub: profileData.homeClub || ""
        }
      })
    } catch (clerkErr) {
      console.warn("[Auth] Clerk profile sync failed (non-fatal):", clerkErr)
    }

    // Write audit log
    await logAuditAction(userId, profileData.email, "UPDATE_PROFILE", userId, { 
      roleChanged: roleToSet !== caller.role,
      newRole: roleToSet,
      newStatus
    })

    return {
      success: true,
      simulated: false,
      user: {
        id: userId,
        email: profileData.email,
        fullName: profileData.fullName,
        role: roleToSet,
        status: newStatus,
        imageUrl: profileData.imageUrl || "",
        bio: profileData.bio || "",
        homeClub: profileData.homeClub || ""
      }
    }
  } catch (error) {
    console.error("[User] updateUserProfileAction error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile"
    }
  }
}
