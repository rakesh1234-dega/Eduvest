-- ─── ADMIN DASHBOARD FIX ───
-- Run this in your Supabase SQL Editor to allow Admins to see all users and data.

-- 1. Allow Admins to view ALL user profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- 2. Allow Admins to view ALL transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- 3. Allow Admins to view ALL activity logs
DROP POLICY IF EXISTS "Admins can view all activity_logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity_logs" 
ON public.activity_logs 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);

-- 4. Allow Admins to view ALL schedules
DROP POLICY IF EXISTS "Admins can view all schedules" ON public.schedules;
CREATE POLICY "Admins can view all schedules" 
ON public.schedules 
FOR SELECT 
USING (
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'admin'
);
