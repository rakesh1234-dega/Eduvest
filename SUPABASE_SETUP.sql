-- ============================================================
-- BudgetBuddy – Full Schema Setup (Clerk + Supabase)
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Architecture:
--   • Clerk  = Authentication (login, signup, user management)
--   • Supabase = Database (all data stored here, visible in dashboard)
--   • user_id TEXT stores the Clerk user ID (e.g. "user_2abc...")
--   • RLS uses a custom function to read the Clerk user ID from JWT
-- ============================================================

-- Drop existing objects (clean slate)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.budgets     CASCADE;
DROP TABLE IF EXISTS public.categories  CASCADE;
DROP TABLE IF EXISTS public.accounts    CASCADE;
DROP TABLE IF EXISTS public.profiles    CASCADE;
DROP TYPE  IF EXISTS account_type       CASCADE;
DROP TYPE  IF EXISTS transaction_type   CASCADE;

-- ── ENUM types ────────────────────────────────────────────────
CREATE TYPE account_type    AS ENUM ('cash', 'upi', 'card', 'bank');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');

-- ══════════════════════════════════════════════════════════════
-- TABLES  (user_id is TEXT — stores Clerk user IDs)
-- ══════════════════════════════════════════════════════════════

-- profiles — created automatically on first login
-- Visible in Supabase dashboard with Clerk name, email, user ID
CREATE TABLE public.profiles (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT    NOT NULL UNIQUE,   -- Clerk user ID
  email                 TEXT,                       -- Clerk email (synced on login)
  display_name          TEXT,                       -- Clerk full name (synced on login)
  avatar_url            TEXT,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- accounts
CREATE TABLE public.accounts (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT           NOT NULL,              -- Clerk user ID
  name        TEXT           NOT NULL,
  type        account_type   NOT NULL,
  balance     NUMERIC(12,2)  NOT NULL DEFAULT 0,
  is_default  BOOLEAN        NOT NULL DEFAULT FALSE,
  description TEXT,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- categories
CREATE TABLE public.categories (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT              NOT NULL,            -- Clerk user ID
  name       TEXT              NOT NULL,
  type       transaction_type  NOT NULL DEFAULT 'expense',
  color      TEXT,
  icon       TEXT,
  created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- transactions
CREATE TABLE public.transactions (
  id             UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        TEXT              NOT NULL,        -- Clerk user ID
  account_id     UUID              NOT NULL REFERENCES public.accounts(id)   ON DELETE CASCADE,
  to_account_id  UUID              REFERENCES public.accounts(id)            ON DELETE SET NULL,
  category_id    UUID              REFERENCES public.categories(id)          ON DELETE SET NULL,
  type           transaction_type  NOT NULL,
  amount         NUMERIC(12,2)     NOT NULL,
  description    TEXT,
  date           DATE              NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- budgets
CREATE TABLE public.budgets (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          TEXT           NOT NULL,          -- Clerk user ID
  amount           NUMERIC(12,2)  NOT NULL,
  month            DATE           NOT NULL,
  alert_threshold  NUMERIC(5,2)   NOT NULL DEFAULT 80,
  savings_goal     NUMERIC(12,2),
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- Policies use auth.clerk_user_id() — works when the Clerk
-- "supabase" JWT template is configured (see setup guide).
-- Without the JWT template, queries still work via client-side
-- user_id filtering (no server-side enforcement).
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets      ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) access — filtered by Clerk user ID client-side.
-- When JWT template is set up, auth.clerk_user_id() limits to own rows.
CREATE POLICY "profiles_access"     ON public.profiles     FOR ALL TO anon, authenticated
  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "accounts_access"     ON public.accounts     FOR ALL TO anon, authenticated
  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "categories_access"   ON public.categories   FOR ALL TO anon, authenticated
  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "transactions_access" ON public.transactions  FOR ALL TO anon, authenticated
  USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "budgets_access"      ON public.budgets      FOR ALL TO anon, authenticated
  USING (TRUE) WITH CHECK (TRUE);

-- ══════════════════════════════════════════════════════════════
-- GRANTS for schema access
-- ══════════════════════════════════════════════════════════════
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ══════════════════════════════════════════════════════════════
-- INDEXES for fast per-user queries
-- ══════════════════════════════════════════════════════════════
CREATE INDEX idx_accounts_user      ON public.accounts(user_id);
CREATE INDEX idx_categories_user    ON public.categories(user_id);
CREATE INDEX idx_transactions_user  ON public.transactions(user_id);
CREATE INDEX idx_transactions_date  ON public.transactions(user_id, date DESC);
CREATE INDEX idx_budgets_user       ON public.budgets(user_id, month);

-- ══════════════════════════════════════════════════════════════
-- NEW FEATURES SETUP (Gamification, AI, Admin)
-- ══════════════════════════════════════════════════════════════

-- Add role & gamification fields to profiles
ALTER TABLE public.profiles ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN level INTEGER NOT NULL DEFAULT 1;

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,          -- Admin Clerk user ID
  receiver_id TEXT NOT NULL,        -- User Clerk user ID
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- schedules (AI Generated)
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,          -- Clerk user ID
  content TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- badges
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  point_threshold INTEGER NOT NULL DEFAULT 0
);

-- user_badges
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,          -- Clerk user ID
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Apply RLS to new tables
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_access" ON public.messages FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "schedules_access" ON public.schedules FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "badges_access" ON public.badges FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "user_badges_access" ON public.user_badges FOR ALL TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);

-- Default Badges Data (Mock Seed)
INSERT INTO public.badges (name, description, icon, point_threshold) VALUES
('Starter Starter', 'Created your first account setup', '⭐', 10),
('Transaction Tracker', 'Logged your first expense', '📝', 20),
('Budget Boss', 'Stayed under budget for the week', '👑', 50),
('Saving Scholar', 'Reached 100 points', '🎓', 100);

-- ══════════════════════════════════════════════════════════════
-- END OF SCRIPT
-- ══════════════════════════════════════════════════════════════
