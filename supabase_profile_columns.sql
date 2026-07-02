-- Run this in your Supabase Dashboard -> SQL Editor
-- This adds the necessary columns for users' bios and home clubs to their profiles.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_club TEXT;
