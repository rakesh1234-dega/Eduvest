// ─── EduVest Email Notification System ───────────────────────────────────────
// types.ts — All TypeScript interfaces for the email notification system
// These are client-safe types only — no secrets, no Resend imports here.

export type EmailType =
  | "welcome"
  | "budget_warning"
  | "budget_exceeded"
  | "daily_summary"
  | "low_balance"
  | "goal_achieved"
  | "monthly_summary"
  | "reminder";

// ─── Email Payload Types ──────────────────────────────────────────────────────

export interface WelcomeEmailData {
  userName: string;
}

export interface BudgetWarningEmailData {
  userName: string;
  percentUsed: number;       // e.g. 82
  totalBudget: number;       // e.g. 15000
  totalSpent: number;        // e.g. 12300
  remaining: number;         // e.g. 2700
  month: string;             // e.g. "April 2026"
}

export interface BudgetExceededEmailData {
  userName: string;
  totalBudget: number;
  totalSpent: number;
  exceededBy: number;
  month: string;
}

export interface DailySummaryEmailData {
  userName: string;
  date: string;              // e.g. "April 4, 2026"
  totalSpentToday: number;
  totalIncomeToday: number;
  transactionCount: number;
  topCategory: string;
}

export interface LowBalanceEmailData {
  userName: string;
  accountName: string;       // e.g. "UPI Account"
  accountType: string;       // e.g. "upi"
  currentBalance: number;
  threshold: number;
}

export interface GoalAchievedEmailData {
  userName: string;
  goalName: string;          // e.g. "Monthly Savings Goal"
  targetAmount: number;
  achievedAmount: number;
  month: string;
}

export interface MonthlySummaryEmailData {
  userName: string;
  month: string;             // e.g. "March 2026"
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  budgetAmount: number;
  budgetUsedPercent: number;
  topCategory: string;
  transactionCount: number;
}

export interface ReminderEmailData {
  userName: string;
  reason: "no_transactions" | "no_budget" | "no_account";
  daysSinceLastActivity?: number;
}

// ─── Union payload type for Edge Function ────────────────────────────────────
export type EmailPayload =
  | { emailType: "welcome"; to: string; data: WelcomeEmailData }
  | { emailType: "budget_warning"; to: string; data: BudgetWarningEmailData }
  | { emailType: "budget_exceeded"; to: string; data: BudgetExceededEmailData }
  | { emailType: "daily_summary"; to: string; data: DailySummaryEmailData }
  | { emailType: "low_balance"; to: string; data: LowBalanceEmailData }
  | { emailType: "goal_achieved"; to: string; data: GoalAchievedEmailData }
  | { emailType: "monthly_summary"; to: string; data: MonthlySummaryEmailData }
  | { emailType: "reminder"; to: string; data: ReminderEmailData };

// ─── Email Log (mirrors Supabase email_logs table) ────────────────────────────
export interface EmailLog {
  id: string;
  user_id: string;
  email_type: EmailType;
  reference_key: string;    // e.g. "2026-04" for monthly, "2026-04-04" for daily
  sent_at: string;
  status: "sent" | "failed";
}

// ─── Deduplication Periods ────────────────────────────────────────────────────
export type DeduplicationPeriod = "once_ever" | "daily" | "monthly" | "per_24h" | "per_3days" | "per_event";
