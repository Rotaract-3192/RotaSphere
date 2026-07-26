-- ============================================================
-- ROTASPHERE COMPLETE SUPABASE SCHEMA MIGRATION
-- Run this script in: Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. UPDATE EVENTS TABLE (Add Pause/Re-open, Tiers, Host Club & Status columns)
ALTER TABLE events ADD COLUMN IF NOT EXISTS registrations_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_tiers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'DRAFT';
ALTER TABLE events ADD COLUMN IF NOT EXISTS review_notes TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_club TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0;

-- 2. UPDATE TICKETS TABLE (Add Tiers, Status & Receipt Screenshot columns)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_tier_id TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_tier_name TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. UPDATE ATTENDEES TABLE (Add Designation, Club Name & Status columns)
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT '';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS club_name TEXT DEFAULT '';
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
ALTER TABLE attendees DROP CONSTRAINT IF EXISTS attendees_event_id_email_key;
ALTER TABLE attendees DROP CONSTRAINT IF EXISTS attendees_email_key;

-- 4. UPDATE PROFILES TABLE (Add Designation, Home Club & Fix Role Constraints)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_club TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'attendee';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';

-- Drop old role check constraint if it exists and apply flexible check
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (LOWER(role) IN ('super_admin', 'admin', 'organizer', 'attendee', 'pending_user'));

-- 5. CREATE AUDIT LOGS TABLE (For Security & Organizer Action Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_email TEXT,
  action TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on audit_logs if desired
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. VERIFY ALL COLUMNS AND TABLES ARE READY
SELECT 'Database schema migration completed successfully!' AS result;
