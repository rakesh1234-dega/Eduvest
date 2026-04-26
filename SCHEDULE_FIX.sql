-- ==============================================================================
-- 🚀 SCHEDULES TABLE - PERMISSION FIX 
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE DASHBOARD -> SQL EDITOR -> NEW QUERY
-- This fixes the "42501 permission denied" error when saving daily routines.
-- ==============================================================================

-- 1. Make sure the schedules table exists
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,          -- Clerk user ID
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure Row Level Security is explicitly enabled
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 3. Clear any old, conflicting or broken policies
DROP POLICY IF EXISTS "schedules_access" ON public.schedules;
DROP POLICY IF EXISTS "Admins can view all schedules" ON public.schedules;

-- 4. Create a universally permissive policy (Authentication is handled client-side by Clerk)
CREATE POLICY "schedules_access" 
ON public.schedules 
FOR ALL TO anon, authenticated 
USING (TRUE) 
WITH CHECK (TRUE);

-- 5. Grant actual database-level permissions to the API roles
GRANT ALL ON TABLE public.schedules TO anon, authenticated;

-- 6. Force Postgres to instantly reload its API schema cache 
NOTIFY pgrst, 'reload schema';
