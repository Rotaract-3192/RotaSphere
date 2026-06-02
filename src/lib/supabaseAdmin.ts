import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseAdminConfigured = !!(supabaseUrl && supabaseServiceRoleKey)

export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseServiceRoleKey || "placeholder-service-role-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
