-- ============================================================
-- ROTASPHERE TICKETS CONSTRAINT FIX: Update tickets table check constraints
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Drop old status check constraint
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

-- 2. Add new status check constraint with all required offline booking statuses (lowercase)
ALTER TABLE tickets ADD CONSTRAINT tickets_status_check 
  CHECK (status IN ('active', 'pending', 'rejected', 'cancelled'));

-- 3. Also verify screenshot url column is added to support offline checkout receipts
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- 4. Verify existing tickets constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'tickets'::regclass;
