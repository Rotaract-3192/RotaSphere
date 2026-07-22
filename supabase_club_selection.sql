-- Run this in your Supabase Dashboard -> SQL Editor to enable club selection

-- 1. Add host_club column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS host_club TEXT;

-- 2. Add club_name column to attendees table
ALTER TABLE attendees ADD COLUMN IF NOT EXISTS club_name TEXT;
