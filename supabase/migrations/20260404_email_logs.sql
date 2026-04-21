-- EduVest Email Notification System
-- Migration: Create email_logs table for server-side deduplication
-- This prevents duplicate daily/monthly emails even across devices/sessions

CREATE TABLE IF NOT EXISTS public.email_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  email_type  TEXT NOT NULL,
  reference_key TEXT NOT NULL,       -- e.g. "2026-04" for monthly, "2026-04-04" for daily
  sent_at     TIMESTAMPTZ DEFAULT now(),
  status      TEXT DEFAULT 'sent'    -- 'sent' | 'failed'
);

-- Unique constraint prevents duplicate emails at the DB level
-- This is the server-side guard (client uses localStorage as first check)
CREATE UNIQUE INDEX IF NOT EXISTS email_logs_dedup_idx
  ON public.email_logs (user_id, email_type, reference_key);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS email_logs_user_idx ON public.email_logs (user_id);
CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON public.email_logs (sent_at DESC);

-- Optional RLS (Row Level Security) — enable if needed
-- ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own logs" ON public.email_logs FOR SELECT USING (user_id = auth.uid()::text);
