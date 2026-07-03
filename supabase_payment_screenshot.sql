-- Run this in your Supabase Dashboard -> SQL Editor
-- This adds a screenshot column to the tickets table to support offline/manual UPI ticket processing.
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
