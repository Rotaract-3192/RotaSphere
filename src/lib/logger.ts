import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin"

export interface LogEntry {
  userId?: string
  userEmail?: string
  action: string
  targetId?: string
  level?: "INFO" | "WARN" | "ERROR"
  details?: Record<string, any>
  errorMsg?: string
}

export async function logEvent(entry: LogEntry) {
  const level = entry.level || "INFO"
  const timestamp = new Date().toISOString()
  
  // 1. High visibility server console logging
  console.log(`\n==================================================`)
  console.log(`[${timestamp}] [${level}] Action: ${entry.action}`)
  if (entry.userEmail) console.log(`User: ${entry.userEmail} (${entry.userId || 'N/A'})`)
  if (entry.targetId) console.log(`Target ID: ${entry.targetId}`)
  if (entry.errorMsg) console.error(`🔴 ERROR: ${entry.errorMsg}`)
  if (entry.details && Object.keys(entry.details).length > 0) {
    console.log(`📦 Details:`, JSON.stringify(entry.details, null, 2))
  }
  console.log(`==================================================\n`)

  // 2. Persist to Supabase audit_logs database table
  if (isSupabaseAdminConfigured) {
    try {
      await supabaseAdmin.from("audit_logs").insert({
        user_id: entry.userId || "system",
        user_email: entry.userEmail || "system@rotasphere.org",
        action: `${level}_${entry.action}`,
        target_id: entry.targetId || "",
        details: {
          ...(entry.details || {}),
          errorMsg: entry.errorMsg || null,
          timestamp,
          level
        }
      })
    } catch (err) {
      console.error("[Logger] Failed to insert audit log entry into Supabase:", err)
    }
  }
}
