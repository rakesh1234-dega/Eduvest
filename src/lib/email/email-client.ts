// ─── EduVest Email Notification System ───────────────────────────────────────
// email-client.ts — Frontend service that calls the Supabase Edge Function
//
// SECURITY: This file never imports Resend or exposes any API key.
// It calls our own Supabase Edge Function which handles Resend server-side.

import { supabase } from "@/integrations/supabase/client";
import type {
  EmailType,
  WelcomeEmailData,
  BudgetWarningEmailData,
  BudgetExceededEmailData,
  DailySummaryEmailData,
  LowBalanceEmailData,
  GoalAchievedEmailData,
  MonthlySummaryEmailData,
  ReminderEmailData,
} from "./types";

// ─── Core Edge Function caller ────────────────────────────────────────────────

async function callEmailFunction(
  emailType: EmailType,
  to: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!to || !to.includes("@")) {
      console.warn("[EduVest Email] Invalid recipient email — skipping send.");
      return { success: false, error: "Invalid recipient" };
    }

    const { data: result, error } = await supabase.functions.invoke("send-email", {
      body: { emailType, to, data },
    });

    if (error) {
      console.warn(`[EduVest Email] Edge function unavailable (${emailType}). This is harmless if you haven't deployed Supabase Edge Functions. Details:`, error.message);
      return { success: false, error: error.message };
    }

    if (result?.error) {
      console.warn(`[EduVest Email] Resend error (${emailType}):`, result.error);
      return { success: false, error: result.error };
    }

    console.info(`[EduVest Email] ✓ Sent ${emailType} to ${to}`);
    return { success: true };
  } catch (err: any) {
    // Never crash the app — email is non-critical
    console.warn(`[EduVest Email] Unexpected error (${emailType}):`, err?.message ?? err);
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}

// ─── Public email send functions ──────────────────────────────────────────────

/** Send a welcome email after onboarding completion */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
): Promise<boolean> {
  const result = await callEmailFunction("welcome", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a budget warning email when spending reaches the alert threshold */
export async function sendBudgetWarningEmail(
  to: string,
  data: BudgetWarningEmailData
): Promise<boolean> {
  const result = await callEmailFunction("budget_warning", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a budget exceeded email when monthly expenses cross the budget */
export async function sendBudgetExceededEmail(
  to: string,
  data: BudgetExceededEmailData
): Promise<boolean> {
  const result = await callEmailFunction("budget_exceeded", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a daily spending summary email */
export async function sendDailySummaryEmail(
  to: string,
  data: DailySummaryEmailData
): Promise<boolean> {
  const result = await callEmailFunction("daily_summary", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a low balance warning email for a specific account */
export async function sendLowBalanceEmail(
  to: string,
  data: LowBalanceEmailData
): Promise<boolean> {
  const result = await callEmailFunction("low_balance", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a goal achieved celebration email */
export async function sendGoalAchievedEmail(
  to: string,
  data: GoalAchievedEmailData
): Promise<boolean> {
  const result = await callEmailFunction("goal_achieved", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a monthly financial summary email */
export async function sendMonthlySummaryEmail(
  to: string,
  data: MonthlySummaryEmailData
): Promise<boolean> {
  const result = await callEmailFunction("monthly_summary", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Send a smart finance reminder email for inactive users */
export async function sendReminderEmail(
  to: string,
  data: ReminderEmailData
): Promise<boolean> {
  const result = await callEmailFunction("reminder", to, data as unknown as Record<string, unknown>);
  return result.success;
}

/** Generic test function — send any email type manually (for Settings panel) */
export async function sendTestEmail(
  emailType: EmailType,
  to: string
): Promise<{ success: boolean; error?: string }> {
  const mockData: Record<EmailType, Record<string, unknown>> = {
    welcome: { userName: "Test User" },
    budget_warning: {
      userName: "Test User", percentUsed: 85, totalBudget: 15000,
      totalSpent: 12750, remaining: 2250, month: "April 2026",
    },
    budget_exceeded: {
      userName: "Test User", totalBudget: 15000, totalSpent: 17500,
      exceededBy: 2500, month: "April 2026",
    },
    daily_summary: {
      userName: "Test User", date: "April 4, 2026", totalSpentToday: 850,
      totalIncomeToday: 0, transactionCount: 3, topCategory: "Food & Dining",
    },
    low_balance: {
      userName: "Test User", accountName: "UPI Wallet", accountType: "upi",
      currentBalance: 320, threshold: 500,
    },
    goal_achieved: {
      userName: "Test User", goalName: "Monthly Savings Goal",
      targetAmount: 5000, achievedAmount: 5200, month: "April 2026",
    },
    monthly_summary: {
      userName: "Test User", month: "March 2026", totalIncome: 25000,
      totalExpense: 18000, netSavings: 7000, budgetAmount: 20000,
      budgetUsedPercent: 90, topCategory: "Food & Dining", transactionCount: 42,
    },
    reminder: {
      userName: "Test User", reason: "no_transactions", daysSinceLastActivity: 4,
    },
  };

  return await callEmailFunction(emailType, to, mockData[emailType]);
}
