-- ==============================================================================
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE DASHBOARD -> SQL EDITOR -> NEW QUERY
-- This will create the missing tables, fix RLS permissions, and reload the cache.
-- ==============================================================================

-- 1. Create the `messages` table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the `activity_logs` table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    points_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create the `notifications` table (which seems to be missing or blocked)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL, -- Clerk user_id
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'system',
    is_read boolean DEFAULT false,
    link text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 5. Set up permissive RLS Policies (for client-side routing)
-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "messages_access" ON public.messages;
DROP POLICY IF EXISTS "activity_logs_access" ON public.activity_logs;
DROP POLICY IF EXISTS "notifications_access" ON public.notifications;

-- Create policies that allow anon and authenticated users to insert/read 
-- (Because Clerk JWT integration might be absent passing as anon)
CREATE POLICY "messages_access" ON public.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activity_logs_access" ON public.activity_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "notifications_access" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. Grant Permissions
GRANT ALL ON TABLE public.messages TO anon, authenticated;
GRANT ALL ON TABLE public.activity_logs TO anon, authenticated;
GRANT ALL ON TABLE public.notifications TO anon, authenticated;

-- 7. Force Postgres to reload its schema cache (resolves 404 Not Found errors instantly)
NOTIFY pgrst, 'reload schema';
