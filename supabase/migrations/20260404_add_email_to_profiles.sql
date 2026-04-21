-- Add email field to profiles for server-side email notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
