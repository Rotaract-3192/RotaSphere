-- Run this in your Supabase Dashboard -> SQL Editor
-- This adds designation columns to the profiles and attendees tables.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS designation TEXT;
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS designation TEXT;
