/**
 * Direct Email Sender (Admin-only)
 * Calls Resend API directly from the browser for admin test emails.
 * This bypasses the Supabase Edge Function which may not be deployed.
 * 
 * IMPORTANT: The API key is stored in localStorage (admin sets it once).
 * This is acceptable because only admins access this function.
 */

import type { EmailType } from "./types";

// Note: In development, this points to the Vite proxy in vite.config.ts to avoid CORS.
// In production, this would either need a backend or edge function.
const RESEND_API_URL = "/resend-proxy/emails";

// Admin stores their Resend API key in localStorage
export function setResendApiKey(key: string) {
  localStorage.setItem("eduvest_resend_key", key);
}

export function getResendApiKey(): string | null {
  return localStorage.getItem("eduvest_resend_key");
}

export function clearResendApiKey() {
  localStorage.removeItem("eduvest_resend_key");
}

// Email subject + plain text body generators (no HTML needed for simple sends)
const EMAIL_CONTENT: Record<EmailType, { subject: string; bodyFn: (data: Record<string, unknown>) => string }> = {
  welcome: {
    subject: "Welcome to EduVest 🚀 — Your financial journey starts now",
    bodyFn: (d) => `Hey ${d.userName || "there"},\n\nWelcome to EduVest — the smart finance companion built for students. Start tracking your spending, set budgets, and work towards your financial goals.\n\nHead to your dashboard to get started!\n\n— EduVest Team`,
  },
  budget_warning: {
    subject: "⚠️ Budget Warning — You've used most of your budget",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nYou've used ${d.percentUsed || 80}% of your monthly budget (₹${d.totalBudget || 0}). You have ₹${d.remaining || 0} remaining.\n\nConsider reviewing your spending to stay on track.\n\n— EduVest`,
  },
  budget_exceeded: {
    subject: "🚨 Budget Exceeded — Monthly limit crossed",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nYour spending has exceeded your monthly budget by ₹${d.exceededBy || 0}.\n\nBudget: ₹${d.totalBudget || 0}\nSpent: ₹${d.totalSpent || 0}\n\nReview your Analytics to identify areas to cut back.\n\n— EduVest`,
  },
  daily_summary: {
    subject: "📊 Your Daily Spending Summary — EduVest",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nHere's your daily summary for ${d.date || "today"}:\n\nSpent: ₹${d.totalSpentToday || 0}\nIncome: ₹${d.totalIncomeToday || 0}\nTransactions: ${d.transactionCount || 0}\nTop Category: ${d.topCategory || "N/A"}\n\nKeep tracking!\n\n— EduVest`,
  },
  low_balance: {
    subject: "⚡ Low Balance Alert — Account running low",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nYour ${d.accountName || "account"} balance is ₹${d.currentBalance || 0}, which is below your ₹${d.threshold || 500} threshold.\n\nConsider topping up or reviewing recent expenses.\n\n— EduVest`,
  },
  goal_achieved: {
    subject: "🎉 Congratulations! Savings goal achieved",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nYou've achieved your ${d.goalName || "savings goal"}!\n\nTarget: ₹${d.targetAmount || 0}\nAchieved: ₹${d.achievedAmount || 0}\n\nKeep up the excellent work!\n\n— EduVest`,
  },
  monthly_summary: {
    subject: "📅 Monthly Financial Summary — EduVest",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nYour ${d.month || "monthly"} summary:\n\nIncome: ₹${d.totalIncome || 0}\nExpenses: ₹${d.totalExpense || 0}\nSavings: ₹${d.netSavings || 0}\nBudget Used: ${d.budgetUsedPercent || 0}%\nTransactions: ${d.transactionCount || 0}\n\n— EduVest`,
  },
  reminder: {
    subject: "💬 EduVest Reminder — We miss you!",
    bodyFn: (d) => `Hi ${d.userName || "there"},\n\nIt's been ${d.daysSinceLastActivity || "a few"} days since your last activity on EduVest.\n\nStaying consistent with tracking is the key to financial success. Jump back in — it only takes a minute!\n\n— EduVest`,
  },
};

const MOCK_DATA: Record<EmailType, Record<string, unknown>> = {
  welcome: { userName: "Student" },
  budget_warning: { userName: "Student", percentUsed: 85, totalBudget: 15000, totalSpent: 12750, remaining: 2250, month: "April 2026" },
  budget_exceeded: { userName: "Student", totalBudget: 15000, totalSpent: 17500, exceededBy: 2500, month: "April 2026" },
  daily_summary: { userName: "Student", date: "April 21, 2026", totalSpentToday: 850, totalIncomeToday: 0, transactionCount: 3, topCategory: "Food" },
  low_balance: { userName: "Student", accountName: "UPI Wallet", accountType: "upi", currentBalance: 320, threshold: 500 },
  goal_achieved: { userName: "Student", goalName: "Monthly Savings", targetAmount: 5000, achievedAmount: 5200, month: "April 2026" },
  monthly_summary: { userName: "Student", month: "March 2026", totalIncome: 25000, totalExpense: 18000, netSavings: 7000, budgetAmount: 20000, budgetUsedPercent: 90, topCategory: "Food", transactionCount: 42 },
  reminder: { userName: "Student", reason: "no_transactions", daysSinceLastActivity: 4 },
};

export async function sendDirectEmail(
  emailType: EmailType,
  to: string,
  userName?: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    return { success: false, error: "Resend API key not set. Enter it in the admin panel." };
  }

  if (!to || !to.includes("@")) {
    return { success: false, error: "Invalid email address" };
  }

  const template = EMAIL_CONTENT[emailType];
  if (!template) {
    return { success: false, error: `Unknown email type: ${emailType}` };
  }

  const data = { ...MOCK_DATA[emailType], userName: userName || "Student" };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "EduVest <onboarding@resend.dev>",
        to: [to],
        subject: template.subject,
        text: template.bodyFn(data),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.message || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error" };
  }
}
