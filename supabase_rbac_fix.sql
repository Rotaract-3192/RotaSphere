-- ============================================================
-- ROTASPHERE RBAC FIX: Update profiles table check constraints
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Drop old role check constraint (only allowed: admin, organizer, attendee)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add new role check constraint with all required roles (lowercase)
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'organizer', 'attendee', 'pending_user'));

-- 3. Update existing rows with legacy uppercase roles to lowercase (just in case)
UPDATE profiles SET role = LOWER(role) 
  WHERE role NOT IN ('super_admin', 'admin', 'organizer', 'attendee', 'pending_user');

-- 4. Also insert the super admin profile if it doesn't exist yet
-- (Replace 'user_3Em0kZTExxLWsW1RcUbWLr0Fn7L' with the actual Clerk ID if different)
INSERT INTO profiles (id, email, full_name, role, status, updated_at)
VALUES (
  'user_3Em0kZTExxLWsW1RcUbWLr0Fn7L',
  'tech.rotaract3192@gmail.com',
  'Tech Rotaract 3192',
  'super_admin',
  'ACTIVE',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  status = 'ACTIVE',
  updated_at = NOW();

-- 5. Verify the result
SELECT id, email, full_name, role, status FROM profiles ORDER BY created_at DESC;
