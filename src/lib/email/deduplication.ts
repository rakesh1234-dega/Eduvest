// ─── EduVest Email Notification System ───────────────────────────────────────
// deduplication.ts — Anti-spam guard to prevent duplicate email sends
//
// Strategy:
//   - Uses localStorage for client-side deduplication (fast, no DB round-trip)
//   - Key format: `eduvest_email_<userId>_<emailType>_<referenceKey>`
//   - Server-side dedup (daily/monthly) is enforced separately by the Edge Function
//     via the email_logs Supabase table (unique constraint on user+type+ref_key)

import type { EmailType, DeduplicationPeriod } from "./types";
import { getDailyKey, getMonthlyKey } from "./formatters";

const STORAGE_PREFIX = "eduvest_email_";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildKey(userId: string, emailType: EmailType, referenceKey: string): string {
  return `${STORAGE_PREFIX}${userId}_${emailType}_${referenceKey}`;
}

function getStoredTimestamp(key: string): number | null {
  try {
    const val = localStorage.getItem(key);
    if (!val) return null;
    return parseInt(val, 10);
  } catch {
    return null;
  }
}

function setStoredTimestamp(key: string): void {
  try {
    localStorage.setItem(key, Date.now().toString());
  } catch {
    // localStorage unavailable — skip dedup (fail open, not closed)
  }
}

// ─── Reference key generators per email type ─────────────────────────────────

export function getReferenceKey(emailType: EmailType, extra?: string): string {
  switch (emailType) {
    case "welcome":
      return "once_ever";
    case "daily_summary":
      return getDailyKey();
    case "monthly_summary":
      return getMonthlyKey();
    case "budget_warning":
      return `warning_${getMonthlyKey()}`;
    case "budget_exceeded":
      return `exceeded_${getMonthlyKey()}`;
    case "low_balance":
      return `lowbal_${extra ?? "unknown"}_${getDailyKey()}`;
    case "goal_achieved":
      return `goal_${extra ?? getMonthlyKey()}`;
    case "reminder":
      return `reminder_${getDailyKey()}`;
    default:
      return getDailyKey();
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Check if an email of this type can be sent for this user.
 * Returns true if NOT yet sent in the current period.
 *
 * @param userId   Clerk user ID
 * @param emailType  The type of email
 * @param period   How often this email can be sent
 * @param extra    Optional extra discriminator (e.g. account ID for low balance)
 */
export function canSendEmail(
  userId: string,
  emailType: EmailType,
  period: DeduplicationPeriod,
  extra?: string
): boolean {
  const refKey = getReferenceKey(emailType, extra);
  const storageKey = buildKey(userId, emailType, refKey);
  const stored = getStoredTimestamp(storageKey);

  if (stored === null) return true; // Never sent — allow

  const now = Date.now();
  const elapsed = now - stored;

  const ONE_HOUR = 3_600_000;
  const ONE_DAY = 86_400_000;
  const THREE_DAYS = 3 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;

  switch (period) {
    case "once_ever":
      return false; // Never send again once recorded
    case "daily":
      return elapsed > ONE_DAY;
    case "monthly":
      return elapsed > ONE_MONTH;
    case "per_24h":
      return elapsed > ONE_DAY;
    case "per_3days":
      return elapsed > THREE_DAYS;
    case "per_event":
      return false; // Only send once per event (same refKey)
    default:
      return true;
  }
}

/**
 * Record that an email was sent successfully.
 * Call this AFTER the email is sent to prevent duplicates.
 */
export function markEmailSent(
  userId: string,
  emailType: EmailType,
  extra?: string
): void {
  const refKey = getReferenceKey(emailType, extra);
  const storageKey = buildKey(userId, emailType, refKey);
  setStoredTimestamp(storageKey);
}

/**
 * Clear dedup records for a specific user (useful for testing)
 */
export function clearEmailDedup(userId: string, emailType?: EmailType): void {
  try {
    const keys = Object.keys(localStorage);
    const prefix = emailType
      ? `${STORAGE_PREFIX}${userId}_${emailType}_`
      : `${STORAGE_PREFIX}${userId}_`;
    keys.forEach((k) => {
      if (k.startsWith(prefix)) localStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}

/**
 * Check & mark in one atomic call (convenience wrapper)
 * Returns true if allowed + marks as sent. Returns false if already sent.
 */
export function checkAndMarkEmail(
  userId: string,
  emailType: EmailType,
  period: DeduplicationPeriod,
  extra?: string
): boolean {
  if (!canSendEmail(userId, emailType, period, extra)) return false;
  markEmailSent(userId, emailType, extra);
  return true;
}
