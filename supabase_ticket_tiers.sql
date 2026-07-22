-- Run this in your Supabase Dashboard -> SQL Editor to enable multiple ticket tiers

-- 1. Add ticket_tiers column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_tiers JSONB DEFAULT '[]'::jsonb;

-- 2. Add ticket_tier_id and ticket_tier_name to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_tier_id TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_tier_name TEXT;
