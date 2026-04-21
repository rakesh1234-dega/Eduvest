// ─── EduVest Email Notification System ───────────────────────────────────────
// supabase/functions/send-email/templates.ts
// Premium HTML email templates — EduVest branded, fintech-quality

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function wrapTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduVest</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f0f2f7; color: #1e293b; }
    .email-wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(99,102,241,0.08); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 36px 40px 32px; text-align: center; }
    .logo-mark { display: inline-flex; align-items: center; gap: 10px; }
    .logo-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; }
    .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
    .logo-badge { display: inline-block; margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 10px; line-height: 1.2; }
    .subtext { font-size: 15px; color: #64748b; line-height: 1.65; margin-bottom: 28px; }
    .metric-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; }
    .metric-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .metric-row:last-child { border-bottom: none; padding-bottom: 0; }
    .metric-label { font-size: 13px; color: #64748b; font-weight: 500; }
    .metric-value { font-size: 14px; font-weight: 700; color: #111827; }
    .metric-value.green { color: #059669; }
    .metric-value.red { color: #e11d48; }
    .metric-value.amber { color: #d97706; }
    .highlight-box { background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); border: 1.5px solid #c7d2fe; border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; text-align: center; }
    .highlight-number { font-size: 38px; font-weight: 900; color: #4f46e5; letter-spacing: -1px; }
    .highlight-label { font-size: 13px; color: #6366f1; font-weight: 600; margin-top: 4px; }
    .cta-btn { display: block; text-align: center; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff !important; text-decoration: none; padding: 15px 32px; border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: 0.2px; margin: 24px 0 0; }
    .cta-btn:hover { opacity: 0.92; }
    .divider { height: 1px; background: #e2e8f0; margin: 28px 0; }
    .tip-box { background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-top: 20px; }
    .tip-box p { font-size: 13px; color: #15803d; line-height: 1.5; }
    .tag-pill { display: inline-block; background: #eef2ff; color: #4f46e5; border-radius: 8px; font-size: 11px; font-weight: 700; padding: 4px 10px; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 40px; text-align: center; }
    .footer p { font-size: 12px; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #6366f1; text-decoration: none; font-weight: 600; }
    .alert-banner { background: #fff7ed; border: 1.5px solid #fed7aa; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; }
    .alert-banner.danger { background: #fff1f2; border-color: #fecdd3; }
    .alert-banner p { font-size: 13px; color: #92400e; font-weight: 500; }
    .alert-banner.danger p { color: #9f1239; }
    .congrats-banner { background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); border: 1.5px solid #6ee7b7; border-radius: 14px; padding: 24px; text-align: center; margin-bottom: 24px; }
    .congrats-emoji { font-size: 48px; margin-bottom: 10px; }
    .congrats-title { font-size: 20px; font-weight: 800; color: #065f46; }
    .congrats-sub { font-size: 13px; color: #047857; margin-top: 4px; }
    @media (max-width: 600px) {
      .email-wrapper { margin: 0; border-radius: 0; }
      .body, .header, .footer { padding: 24px 20px; }
      .greeting { font-size: 22px; }
      .highlight-number { font-size: 30px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo-mark">
        <span class="logo-icon">🎓</span>
        <span class="logo-text">EduVest</span>
      </div>
      <div class="logo-badge">Smart Finance for Students</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>You received this email because you have an EduVest account.<br />
      <a href="#">Manage email preferences</a> · <a href="#">View in browser</a></p>
      <p style="margin-top:8px;">© 2026 EduVest · Student Finance Platform · All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Helper: Format currency ──────────────────────────────────────────────────
function fc(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Template: Welcome ────────────────────────────────────────────────────────
function welcomeTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const subject = `Welcome to EduVest 🚀 — Your financial journey starts now`;
  const html = wrapTemplate(`
    <span class="tag-pill">✨ New Member</span>
    <p class="greeting">Hey ${userName}, welcome aboard! 🎓</p>
    <p class="subtext">You've just joined <strong>EduVest</strong> — the smart finance companion built for students like you. We're excited to help you take control of your money, build healthy financial habits, and work towards your goals.</p>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">📊 Track spending</span>
        <span class="metric-value green">Add transactions</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💰 Set budgets</span>
        <span class="metric-value green">Monthly limits</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">🎯 Savings goals</span>
        <span class="metric-value green">Stay on target</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📈 Analytics</span>
        <span class="metric-value green">Insights & trends</span>
      </div>
    </div>

    <div class="tip-box">
      <p>💡 <strong>Pro tip:</strong> Start by adding your first transaction — it only takes 10 seconds. The more you track, the smarter your insights get.</p>
    </div>

    <a href="${getAppUrl()}/dashboard" class="cta-btn">Open My Dashboard →</a>
  `);
  return { subject, html };
}

// ─── Template: Budget Warning ─────────────────────────────────────────────────
function budgetWarningTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const pct = Number(data.percentUsed ?? 80);
  const budget = Number(data.totalBudget ?? 0);
  const spent = Number(data.totalSpent ?? 0);
  const remaining = Number(data.remaining ?? 0);
  const month = String(data.month ?? "this month");

  const subject = `⚠️ You've used ${pct}% of your budget for ${month}`;
  const html = wrapTemplate(`
    <span class="tag-pill">⚠️ Budget Alert</span>
    <p class="greeting">Budget check, ${userName}</p>
    <p class="subtext">You've used <strong>${pct}%</strong> of your monthly budget for <strong>${month}</strong>. You're getting close to the limit — here's where you stand:</p>

    <div class="highlight-box">
      <div class="highlight-number">${pct}%</div>
      <div class="highlight-label">of monthly budget used</div>
    </div>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">💰 Total Budget</span>
        <span class="metric-value">${fc(budget)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💸 Total Spent</span>
        <span class="metric-value amber">${fc(spent)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">✅ Remaining</span>
        <span class="metric-value green">${fc(remaining)}</span>
      </div>
    </div>

    <div class="alert-banner">
      <p>📌 You have <strong>${fc(remaining)}</strong> left for the rest of ${month}. Consider pausing non-essential spending to stay on track.</p>
    </div>

    <a href="${getAppUrl()}/budget" class="cta-btn">Review My Budget →</a>
  `);
  return { subject, html };
}

// ─── Template: Budget Exceeded ────────────────────────────────────────────────
function budgetExceededTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const budget = Number(data.totalBudget ?? 0);
  const spent = Number(data.totalSpent ?? 0);
  const exceededBy = Number(data.exceededBy ?? 0);
  const month = String(data.month ?? "this month");

  const subject = `🚨 Budget limit exceeded for ${month}`;
  const html = wrapTemplate(`
    <span class="tag-pill">🚨 Urgent</span>
    <p class="greeting">Budget exceeded, ${userName}</p>
    <p class="subtext">Your monthly spending for <strong>${month}</strong> has crossed your budget limit. Don't panic — awareness is the first step to getting back on track.</p>

    <div class="alert-banner danger">
      <p>🚨 You have exceeded your budget by <strong>${fc(exceededBy)}</strong>. Immediate review is recommended.</p>
    </div>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">💰 Monthly Budget</span>
        <span class="metric-value">${fc(budget)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💸 Total Spent</span>
        <span class="metric-value red">${fc(spent)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">⚠️ Over Budget By</span>
        <span class="metric-value red">${fc(exceededBy)}</span>
      </div>
    </div>

    <div class="tip-box">
      <p>💡 Review your biggest spending categories in Analytics. Identify one non-essential category to cut back on for the remaining days of the month.</p>
    </div>

    <a href="${getAppUrl()}/analytics" class="cta-btn">View Spending Analytics →</a>
  `);
  return { subject, html };
}

// ─── Template: Daily Summary ──────────────────────────────────────────────────
function dailySummaryTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const date = String(data.date ?? "Today");
  const spent = Number(data.totalSpentToday ?? 0);
  const income = Number(data.totalIncomeToday ?? 0);
  const count = Number(data.transactionCount ?? 0);
  const topCat = String(data.topCategory ?? "—");

  const subject = `📊 Your daily spending summary — ${date}`;
  const html = wrapTemplate(`
    <span class="tag-pill">📊 Daily Report</span>
    <p class="greeting">Here's your daily digest, ${userName}</p>
    <p class="subtext">A quick summary of your financial activity on <strong>${date}</strong>. Stay consistent — every entry counts.</p>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">💸 Total Spent Today</span>
        <span class="metric-value red">${fc(spent)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💰 Income Today</span>
        <span class="metric-value green">${income > 0 ? fc(income) : "₹0"}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📂 Top Category</span>
        <span class="metric-value">${topCat}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">🔢 Transactions</span>
        <span class="metric-value">${count} recorded</span>
      </div>
    </div>

    <div class="tip-box">
      <p>💡 <strong>Stay on track:</strong> Small daily check-ins build big financial discipline. Keep logging your transactions to unlock personalized insights.</p>
    </div>

    <a href="${getAppUrl()}/transactions" class="cta-btn">View All Transactions →</a>
  `);
  return { subject, html };
}

// ─── Template: Low Balance ────────────────────────────────────────────────────
function lowBalanceTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const accountName = String(data.accountName ?? "your account");
  const balance = Number(data.currentBalance ?? 0);
  const threshold = Number(data.threshold ?? 500);

  const subject = `⚡ Low balance alert — ${accountName}`;
  const html = wrapTemplate(`
    <span class="tag-pill">⚡ Balance Alert</span>
    <p class="greeting">Balance running low, ${userName}</p>
    <p class="subtext">Your <strong>${accountName}</strong> balance has dropped below your alert threshold. You may want to top up or review your recent expenses.</p>

    <div class="highlight-box">
      <div class="highlight-number" style="color:#e11d48;">${fc(balance)}</div>
      <div class="highlight-label" style="color:#be123c;">Current balance in ${accountName}</div>
    </div>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">💳 Account</span>
        <span class="metric-value">${accountName}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💰 Current Balance</span>
        <span class="metric-value red">${fc(balance)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📉 Alert Threshold</span>
        <span class="metric-value amber">${fc(threshold)}</span>
      </div>
    </div>

    <div class="alert-banner danger">
      <p>⚠️ Consider transferring funds or reviewing recent large expenses from this account.</p>
    </div>

    <a href="${getAppUrl()}/accounts" class="cta-btn">Manage My Accounts →</a>
  `);
  return { subject, html };
}

// ─── Template: Goal Achieved ──────────────────────────────────────────────────
function goalAchievedTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const goalName = String(data.goalName ?? "your savings goal");
  const target = Number(data.targetAmount ?? 0);
  const achieved = Number(data.achievedAmount ?? 0);
  const month = String(data.month ?? "this month");

  const subject = `🎉 Goal achieved! You hit your savings target for ${month}`;
  const html = wrapTemplate(`
    <div class="congrats-banner">
      <div class="congrats-emoji">🎉</div>
      <div class="congrats-title">Congratulations, ${userName}!</div>
      <div class="congrats-sub">You've achieved your savings goal for ${month}</div>
    </div>

    <p class="subtext">This is a huge milestone. You stayed disciplined, tracked your spending, and hit your target. That's what smart financial management looks like.</p>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">🎯 Goal</span>
        <span class="metric-value">${goalName}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📌 Target Amount</span>
        <span class="metric-value">${fc(target)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">✅ Achieved</span>
        <span class="metric-value green">${fc(achieved)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💪 Surplus</span>
        <span class="metric-value green">${fc(achieved - target)}</span>
      </div>
    </div>

    <div class="tip-box">
      <p>🚀 Great momentum! Set your next goal to keep building on this success. Consistent savers build wealth over time.</p>
    </div>

    <a href="${getAppUrl()}/budget" class="cta-btn">Set My Next Goal →</a>
  `);
  return { subject, html };
}

// ─── Template: Monthly Summary ────────────────────────────────────────────────
function monthlySummaryTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const month = String(data.month ?? "Last Month");
  const income = Number(data.totalIncome ?? 0);
  const expense = Number(data.totalExpense ?? 0);
  const savings = Number(data.netSavings ?? 0);
  const budgetAmt = Number(data.budgetAmount ?? 0);
  const budgetPct = Number(data.budgetUsedPercent ?? 0);
  const topCat = String(data.topCategory ?? "—");
  const txCount = Number(data.transactionCount ?? 0);
  const savingsPositive = savings >= 0;

  const subject = `📅 Your ${month} financial summary — EduVest`;
  const html = wrapTemplate(`
    <span class="tag-pill">📅 Monthly Report</span>
    <p class="greeting">${month} in review, ${userName}</p>
    <p class="subtext">Your complete financial summary for <strong>${month}</strong>. Track how you did, learn from your patterns, and plan smarter for next month.</p>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">💰 Total Income</span>
        <span class="metric-value green">${fc(income)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">💸 Total Expenses</span>
        <span class="metric-value red">${fc(expense)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">${savingsPositive ? "🏦 Net Savings" : "⚠️ Net Loss"}</span>
        <span class="metric-value ${savingsPositive ? "green" : "red"}">${fc(Math.abs(savings))}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📊 Budget Used</span>
        <span class="metric-value ${budgetPct > 100 ? "red" : budgetPct > 80 ? "amber" : "green"}">${budgetPct}% of ${fc(budgetAmt)}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">📂 Top Spending Category</span>
        <span class="metric-value">${topCat}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">🔢 Total Transactions</span>
        <span class="metric-value">${txCount}</span>
      </div>
    </div>

    <div class="${savingsPositive ? "tip-box" : "alert-banner"}">
      <p>${savingsPositive
        ? `💪 <strong>Excellent work!</strong> You saved ${fc(savings)} this month. Keep the momentum going!`
        : `📌 <strong>Heads up:</strong> Your expenses exceeded your income by ${fc(Math.abs(savings))}. Review your spending in Analytics.`
      }</p>
    </div>

    <a href="${getAppUrl()}/analytics" class="cta-btn">View Full Analytics →</a>
  `);
  return { subject, html };
}

// ─── Template: Smart Reminder ─────────────────────────────────────────────────
function reminderTemplate(data: Record<string, unknown>): { subject: string; html: string } {
  const userName = String(data.userName ?? "there");
  const reason = String(data.reason ?? "no_transactions");
  const days = Number(data.daysSinceLastActivity ?? 3);

  const reasons: Record<string, { title: string; body: string; cta: string; href: string }> = {
    no_transactions: {
      title: `It's been ${days} days since your last entry`,
      body: `Keeping track of your daily spending is the foundation of good financial health. Even small purchases matter — they add up over time. Jump back in and keep your streak alive!`,
      cta: "Add a Transaction →",
      href: `${getAppUrl()}/transactions`,
    },
    no_budget: {
      title: "You haven't set a budget yet",
      body: `A monthly budget gives you a clear target to work towards. Students who set budgets save significantly more. It takes less than a minute to set yours up!`,
      cta: "Set Up My Budget →",
      href: `${getAppUrl()}/budget`,
    },
    no_account: {
      title: "Your accounts aren't set up yet",
      body: `Add your cash, UPI, and card accounts to get accurate real-time balance tracking. EduVest becomes most powerful when connected to all your money sources.`,
      cta: "Add My Accounts →",
      href: `${getAppUrl()}/accounts`,
    },
  };

  const { title, body, cta, href } = reasons[reason] ?? reasons.no_transactions;
  const subject = `📬 ${title} — EduVest Reminder`;

  const html = wrapTemplate(`
    <span class="tag-pill">💬 Gentle Reminder</span>
    <p class="greeting">Hey ${userName} 👋</p>
    <p class="subtext">${title}.</p>

    <div class="tip-box">
      <p>${body}</p>
    </div>

    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">⚡ What to do</span>
        <span class="metric-value">${cta.replace(" →", "")}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">⏱️ Time needed</span>
        <span class="metric-value green">Under 1 minute</span>
      </div>
    </div>

    <a href="${href}" class="cta-btn">${cta}</a>
    <p style="text-align:center; margin-top:16px; font-size:12px; color:#94a3b8;">You're in control of your finances. We're just here to help.</p>
  `);
  return { subject, html };
}

// ─── App URL helper (uses env var or fallback) ────────────────────────────────
function getAppUrl(): string {
  return Deno.env.get("VITE_APP_URL") ?? "https://eduvest.app";
}

// ─── Main template dispatcher ─────────────────────────────────────────────────
export function buildEmailTemplate(
  emailType: string,
  data: Record<string, unknown>
): { subject: string; html: string } {
  switch (emailType) {
    case "welcome":          return welcomeTemplate(data);
    case "budget_warning":   return budgetWarningTemplate(data);
    case "budget_exceeded":  return budgetExceededTemplate(data);
    case "daily_summary":    return dailySummaryTemplate(data);
    case "low_balance":      return lowBalanceTemplate(data);
    case "goal_achieved":    return goalAchievedTemplate(data);
    case "monthly_summary":  return monthlySummaryTemplate(data);
    case "reminder":         return reminderTemplate(data);
    default:
      return {
        subject: "EduVest Notification",
        html: wrapTemplate(`<p class="greeting">Hello!</p><p class="subtext">You have a new notification from EduVest.</p>`),
      };
  }
}
