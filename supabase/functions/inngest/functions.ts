// ─── EduVest Inngest Background Jobs ──────────────────────────────────────────
// supabase/functions/inngest/functions.ts

import { inngest } from "./client.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { buildEmailTemplate } from "../send-email/templates.ts";

// ── Helpers ──────────────────────────────────────────────────────────────────
const getSupabase = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(supabaseUrl, supabaseServiceKey);
};

async function sendResendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "EduVest <onboarding@resend.dev>";
  
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
  
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html }),
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Failed to send email");
  return data;
}

// ── Inngest Cron Jobs ────────────────────────────────────────────────────────

/**
 * 1. Daily Summary
 * Runs daily at 18:00 UTC
 */
export const cronDailySummary = inngest.createFunction(
  { id: "cron-daily-summary", name: "Daily Spending Summary" },
  { cron: "0 18 * * *" }, // Every day at 18:00
  async ({ step }) => {
    // 1. Get today's start/end timestamps
    const today = new Date().toISOString().split("T")[0];

    // 2. Fetch all users who had expenses or incomes today
    const { data: usersWithActivity } = await step.run("fetch-active-users", async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("transactions")
        .select("user_id")
        .eq("date", today);
        
      if (error) throw error;
      return [...new Set(data.map((t: any) => t.user_id))];
    });

    if (!usersWithActivity || usersWithActivity.length === 0) {
      return { msg: "No users active today." };
    }

    // 3. For each user, fetch details and send email
    const results = await step.run("process-and-send-daily-emails", async () => {
      const supabase = getSupabase();
      const sentList = [];

      for (const userId of usersWithActivity) {
        // Get user profile to find email
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("user_id", userId)
          .single();

        if (!profile || !profile.email) continue;

        // Verify deduplication
        const refKey = today;
        const { data: exists } = await supabase
          .from("email_logs")
          .select("id")
          .eq("user_id", userId)
          .eq("email_type", "daily_summary")
          .eq("reference_key", refKey)
          .single();

        if (exists) continue; // Already sent

        // Fetch their transactions for today
        const { data: txs } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .eq("date", today);

        if (!txs) continue;

        const spent = txs.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);
        const income = txs.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);

        // Send Email
        const { subject, html } = buildEmailTemplate("daily_summary", {
          userName: profile.display_name ?? profile.email.split("@")[0],
          date: new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }),
          totalSpentToday: spent,
          totalIncomeToday: income,
          transactionCount: txs.length,
          topCategory: "Various",
        });

        await sendResendEmail(profile.email, subject, html);

        // Mark as sent in DB
        await supabase.from("email_logs").insert({
          user_id: userId,
          email_type: "daily_summary",
          reference_key: refKey,
        });

        sentList.push(profile.email);
      }

      return sentList;
    });

    return { emailsSent: results.length, recipients: results };
  }
);

/**
 * 2. Monthly Summary
 * Runs 10:00 AM on the 1st day of the month
 */
export const cronMonthlySummary = inngest.createFunction(
  { id: "cron-monthly-summary", name: "Monthly Financial Report" },
  { cron: "0 10 1 * *" },
  async ({ step }) => {
    const today = new Date();
    // E.g., if today is May 1, we look at April 1 to April 30.
    const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
    const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
    const monthLabel = new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const refKey = `monthly_${firstDayLastMonth.substring(0, 7)}`;

    const { data: usersWithActivity } = await step.run("fetch-monthly-users", async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("transactions")
        .select("user_id")
        .gte("date", firstDayLastMonth)
        .lte("date", lastDayLastMonth);
        
      if (error) throw error;
      return [...new Set(data.map((t: any) => t.user_id))];
    });

    if (!usersWithActivity || usersWithActivity.length === 0) return { msg: "No active users last month" };

    const sentList = await step.run("send-monthly-emails", async () => {
      const supabase = getSupabase();
      const list = [];
      for (const userId of usersWithActivity) {
        // Prevent duplicate
        const { data: exists } = await supabase.from("email_logs").select("id").eq("user_id", userId).eq("email_type", "monthly_summary").eq("reference_key", refKey).single();
        if (exists) continue;

        // Fetch User
        const { data: profile } = await supabase.from("profiles").select("email, display_name").eq("user_id", userId).single();
        if (!profile || !profile.email) continue;

        // Fetch Transactions
        const { data: txs } = await supabase.from("transactions").select("*").eq("user_id", userId).gte("date", firstDayLastMonth).lte("date", lastDayLastMonth);
        if (!txs) continue;

        // Fetch Budget
        const { data: budget } = await supabase.from("budgets").select("amount").eq("user_id", userId).eq("month", monthLabel).single();

        const spent = txs.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);
        const income = txs.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
        const budgetAmt = budget?.amount ?? 0;
        const budgetPct = budgetAmt > 0 ? Math.round((spent / budgetAmt) * 100) : 0;

        const { subject, html } = buildEmailTemplate("monthly_summary", {
          userName: profile.display_name ?? profile.email.split("@")[0],
          month: monthLabel,
          totalIncome: income,
          totalExpense: spent,
          netSavings: income - spent,
          budgetAmount: budgetAmt,
          budgetUsedPercent: budgetPct,
          topCategory: "Various",
          transactionCount: txs.length,
        });

        await sendResendEmail(profile.email, subject, html);
        await supabase.from("email_logs").insert({ user_id: userId, email_type: "monthly_summary", reference_key: refKey });
        list.push(profile.email);
      }
      return list;
    });

    return { emailsSent: sentList.length };
  }
);

/**
 * 3. Inactivity Reminder
 * Runs daily at 14:00 (2:00 PM) UTC
 */
export const cronInactivityReminder = inngest.createFunction(
  { id: "cron-inactivity-reminder", name: "Smart Inactivity Nudge" },
  { cron: "0 14 * * *" },
  async ({ step }) => {
    // 3 Days ago
    const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const refKeyPrefix = `reminder_`;

    const { data: profiles } = await step.run("fetch-all-users", async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("profiles").select("user_id, email, display_name");
      if (error) throw error;
      return data;
    });

    if (!profiles) return { msg: "No users" };

    const result = await step.run("check-inactivity-and-send", async () => {
      const supabase = getSupabase();
      const sent = [];
      for (const profile of profiles) {
        if (!profile.email) continue;

        // Check if sent within last 3 days
        const { data: latestLog } = await supabase.from("email_logs").select("sent_at").eq("user_id", profile.user_id).eq("email_type", "reminder").order("sent_at", { ascending: false }).limit(1).maybeSingle();
        if (latestLog) {
           const daysSince = (Date.now() - new Date(latestLog.sent_at).getTime()) / (1000 * 60 * 60 * 24);
           if (daysSince < 3) continue; // Rate limited to max 1 per 3 days
        }

        // Check activity
        const { data: txs } = await supabase.from("transactions").select("date").eq("user_id", profile.user_id).order("date", { ascending: false }).limit(1).maybeSingle();
        
        let shouldSend = false;
        let diffDays = 0;

        if (!txs) {
           shouldSend = true;
           diffDays = 3;
        } else {
           const lastActiveTime = new Date(txs.date).getTime();
           diffDays = Math.floor((Date.now() - lastActiveTime) / (1000 * 60 * 60 * 24));
           if (diffDays >= 3) shouldSend = true;
        }

        if (shouldSend) {
          const { subject, html } = buildEmailTemplate("reminder", {
             userName: profile.display_name ?? profile.email.split("@")[0],
             reason: "no_transactions",
             daysSinceLastActivity: diffDays
          });
          
          await sendResendEmail(profile.email, subject, html);
          await supabase.from("email_logs").insert({ user_id: profile.user_id, email_type: "reminder", reference_key: `${refKeyPrefix}${Date.now()}` });
          sent.push(profile.email);
        }
      }
      return sent;
    });

    return { emailsSent: result.length };
  }
);
/**
 * 4. Welcome Email
 * Triggered on user creation/first-login
 */
export const handleWelcomeEmail = inngest.createFunction(
  { id: "handle-welcome-email", name: "Welcome to EduVest" },
  { event: "app/user.welcome" },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    const result = await step.run("check-and-send-welcome", async () => {
      const supabase = getSupabase();

      // Check if already sent
      const { data: exists } = await supabase
        .from("email_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("email_type", "welcome")
        .single();

      if (exists) return { status: "already_sent" };

      // Send Template
      const { subject, html } = buildEmailTemplate("welcome", {
        userName: name || email.split("@")[0],
      });

      await sendResendEmail(email, subject, html);

      // Log it
      await supabase.from("email_logs").insert({
        user_id: userId,
        email_type: "welcome",
        reference_key: "signup",
      });

      return { status: "sent" };
    });

    return result;
  }
);
