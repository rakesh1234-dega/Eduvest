// ─── EduVest Email Notification System ───────────────────────────────────────
// formatters.ts — Client-safe utility functions for formatting email content

/**
 * Format a number as Indian Rupee currency
 * e.g. 15000 → "₹15,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a decimal as percentage
 * e.g. 0.82 → "82%" or 82 → "82%"
 */
export function formatPercent(value: number): string {
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
}

/**
 * Format a Date or ISO string as a readable date
 * e.g. "2026-04-04" → "April 4, 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a Date or ISO string as a month + year label
 * e.g. "2026-04-01" → "April 2026"
 */
export function formatMonth(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });
}

/**
 * Get a human-readable label for an account type
 * e.g. "upi" → "UPI Wallet", "bank" → "Bank Account"
 */
export function getAccountLabel(type: string): string {
  const labels: Record<string, string> = {
    cash: "Cash",
    upi: "UPI Wallet",
    card: "Card",
    bank: "Bank Account",
  };
  return labels[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Calculate the percentage of budget used
 * e.g. spent=12000, budget=15000 → 80
 */
export function calculateBudgetPercent(spent: number, budget: number): number {
  if (!budget || budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

/**
 * Generate a daily deduplication reference key
 * e.g. → "2026-04-04"
 */
export function getDailyKey(date?: Date): string {
  const d = date ?? new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Generate a monthly deduplication reference key
 * e.g. → "2026-04"
 */
export function getMonthlyKey(date?: Date): string {
  const d = date ?? new Date();
  return d.toISOString().slice(0, 7);
}

/**
 * Get the current month label for email subjects
 * e.g. → "April 2026"
 */
export function getCurrentMonthLabel(): string {
  return formatMonth(new Date());
}

/**
 * Get the previous month label for monthly summary
 * e.g. (called in April) → "March 2026"
 */
export function getPreviousMonthLabel(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return formatMonth(d);
}
