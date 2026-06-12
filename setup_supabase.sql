-- Supabase RLS Policy Fix for Hamid Raza Portfolio
-- Copy and run these commands in your Supabase Dashboard SQL Editor (https://supabase.com)

-- =========================================================================
-- OPTION 1: Disable Row-Level Security (RLS) on site_content (RECOMMENDED)
-- Since the admin panel runs client-side and saves directly using the anon key
-- without user login, disabling RLS is the most reliable way to allow saves.
-- =========================================================================

ALTER TABLE site_content DISABLE ROW LEVEL SECURITY;


-- =========================================================================
-- OPTION 2: Alternative (If you prefer to keep RLS enabled but allow public access)
-- Run this instead if you want RLS enabled but want to permit all operations.
-- =========================================================================
/*
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies on the table to avoid conflicts
DROP POLICY IF EXISTS "Allow public access" ON site_content;
DROP POLICY IF EXISTS "Allow anon insert" ON site_content;
DROP POLICY IF EXISTS "Allow anon update" ON site_content;
DROP POLICY IF EXISTS "Allow anon select" ON site_content;
DROP POLICY IF EXISTS "Allow anon delete" ON site_content;

-- Create a policy that allows anyone (anon) to perform SELECT, INSERT, UPDATE, and DELETE
CREATE POLICY "Allow public access" ON site_content
FOR ALL
TO public
USING (true)
WITH CHECK (true);
*/


-- =========================================================================
-- OPTION 3: Insert initial placeholders if they were deleted
-- This ensures the rows exist for updates/patches.
-- =========================================================================

INSERT INTO site_content (id, html_content) 
VALUES 
  ('index', ''), 
  ('portfolio', '')
ON CONFLICT (id) DO NOTHING;


-- =========================================================================
-- OPTION 4: RLS policy fix for contact_messages table
-- Run this to allow anonymous visitors to submit contact messages.
-- =========================================================================

-- Option A: Disable RLS on contact_messages (Simplest & Recommended)
ALTER TABLE contact_messages DISABLE ROW LEVEL SECURITY;

-- Option B: Keep RLS enabled but allow public inserts (Alternative)
/*
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON contact_messages;
CREATE POLICY "Allow anonymous inserts" ON contact_messages 
FOR INSERT TO anon 
WITH CHECK (true);
*/
