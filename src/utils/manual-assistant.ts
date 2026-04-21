/**
 * Manual Intent Engine & Comprehensive Knowledge Base
 * 
 * This file powers the Smart Assistant chatbot entirely without AI.
 * It uses keyword detection, intent mapping, page-context awareness,
 * and structured response templates.
 * 
 * EDITABLE: Update PAGE_KNOWLEDGE, KEYWORD_MAP, or RESPONSES to modify assistant behavior.
 */

// ─── Intent Definitions ─────────────────────────────────────

export const INTENTS = {
  GREETING:            "GREETING",
  ASK_APP_INTRO:       "ASK_APP_INTRO",
  ASK_FEATURE:         "ASK_FEATURE",
  ASK_NAVIGATION:      "ASK_NAVIGATION",
  ASK_FORM_HELP:       "ASK_FORM_HELP",
  ASK_BUDGET_HELP:     "ASK_BUDGET_HELP",
  ASK_SCHEDULE_HELP:   "ASK_SCHEDULE_HELP",
  ASK_MONTHLY_REVIEW:  "ASK_MONTHLY_REVIEW",
  ASK_TRANSACTION:     "ASK_TRANSACTION",
  ASK_DASHBOARD_HELP:  "ASK_DASHBOARD_HELP",
  ASK_PROFILE_HELP:    "ASK_PROFILE_HELP",
  ASK_ACCOUNT_HELP:    "ASK_ACCOUNT_HELP",
  ASK_ANALYTICS_HELP:  "ASK_ANALYTICS_HELP",
  ASK_LEADERBOARD:     "ASK_LEADERBOARD",
  ASK_INBOX:           "ASK_INBOX",
  ASK_ENTER_APP:       "ASK_ENTER_APP",
  ASK_PAGE_EXPLAIN:    "ASK_PAGE_EXPLAIN",
  ASK_REMAINING:       "ASK_REMAINING",
  ASK_SETTINGS:        "ASK_SETTINGS",
  THANK_YOU:           "THANK_YOU",
  GOODBYE:             "GOODBYE",
  UNKNOWN:             "UNKNOWN",
} as const;

// ─── Keyword → Intent Mapping ───────────────────────────────

const KEYWORD_MAP = [
  { intent: INTENTS.GREETING,           keywords: ["hi", "hello", "hey", "greetings", "good morning", "good evening", "good afternoon", "sup", "howdy"] },
  { intent: INTENTS.THANK_YOU,          keywords: ["thank", "thanks", "thank you", "thx", "appreciate"] },
  { intent: INTENTS.GOODBYE,            keywords: ["bye", "goodbye", "see you", "later", "take care", "quit", "exit"] },
  { intent: INTENTS.ASK_APP_INTRO,      keywords: ["what is this", "what does this app", "how does this work", "about this app", "what can you do", "what is eduvest", "tell me about", "introduce", "purpose", "what is this website", "explain this app"] },
  { intent: INTENTS.ASK_FEATURE,        keywords: ["feature", "what can i do", "capabilities", "functionalities", "modules", "tools available"] },
  { intent: INTENTS.ASK_NAVIGATION,     keywords: ["where", "find", "page", "go to", "navigate", "which page", "how to reach", "open", "where is", "how do i get to", "take me to", "show me"] },
  { intent: INTENTS.ASK_FORM_HELP,      keywords: ["fill", "form", "enter", "input", "field", "what should i type", "what details", "how to fill"] },
  { intent: INTENTS.ASK_BUDGET_HELP,    keywords: ["budget", "limit", "monthly money", "spending limit", "set budget", "create a budget", "how to budget", "budget setup"] },
  { intent: INTENTS.ASK_REMAINING,      keywords: ["remaining", "left", "balance left", "how much left", "remaining budget", "money left", "what is remaining"] },
  { intent: INTENTS.ASK_SCHEDULE_HELP,  keywords: ["schedule", "routine", "planner", "plan my day", "timetable", "study time", "free time", "plan my week", "daily plan", "generate schedule", "create schedule", "my plan today", "next task", "today plan", "what is my plan", "how is schedule made", "edit routine", "completion", "complete task"] },
  { intent: INTENTS.ASK_MONTHLY_REVIEW, keywords: ["review", "monthly review", "month-end", "insights", "adjust next month", "monthly report", "monthly summary", "suggestion"] },
  { intent: INTENTS.ASK_TRANSACTION,    keywords: ["transaction", "expense", "add expense", "income", "add income", "receipt", "entry", "log entry", "record expense", "where do i add expenses"] },
  { intent: INTENTS.ASK_DASHBOARD_HELP, keywords: ["dashboard", "home", "overview", "summary", "stats", "main page", "stat cards", "cash flow", "pie chart", "spending breakdown"] },
  { intent: INTENTS.ASK_PROFILE_HELP,   keywords: ["profile", "settings", "my account", "my profile", "edit profile", "change name", "avatar"] },
  { intent: INTENTS.ASK_ACCOUNT_HELP,   keywords: ["account", "accounts", "wallet", "cash account", "upi account", "card account", "bank account", "add account", "create account", "delete account", "money account"] },
  { intent: INTENTS.ASK_ANALYTICS_HELP, keywords: ["analytics", "chart", "graph", "trend", "visual", "report", "analysis", "patterns", "spending pattern"] },
  { intent: INTENTS.ASK_LEADERBOARD,    keywords: ["leaderboard", "ranking", "rank", "top savers", "compete", "points", "gamification", "level"] },
  { intent: INTENTS.ASK_INBOX,          keywords: ["inbox", "message", "notification", "mail", "admin message"] },
  { intent: INTENTS.ASK_ENTER_APP,      keywords: ["enter application", "enter app", "data entry", "log data", "quick entry", "enter details"] },
  { intent: INTENTS.ASK_PAGE_EXPLAIN,   keywords: ["what is this page", "what do i do here", "explain this page", "what page am i on", "where am i", "this page", "current page"] },
  { intent: INTENTS.ASK_SETTINGS,       keywords: ["settings", "preferences", "config", "configuration", "theme", "dark mode", "change password"] },
];

// ─── Full Page Knowledge Base ───────────────────────────────
// Each page has: name, purpose, features, fields, buttons, FAQ-style Q&A

export const PAGE_KNOWLEDGE: Record<string, {
  name: string;
  purpose: string;
  keyFeatures: string[];
  fields?: string[];
  buttons?: string[];
  faq: { q: string; a: string }[];
}> = {

  "/dashboard": {
    name: "Dashboard",
    purpose: "Your main command center. Gives you a real-time overview of your total balance, monthly income, monthly expenses, and budget utilization. It also shows your daily schedule, cash flow trends, spending breakdown by category, gamification level, and recent transactions.",
    keyFeatures: [
      "Stat Cards — Total Balance, Monthly Income, Monthly Expenses, Monthly Budget",
      "Smart Daily Planner — generates and shows your manual daily schedule with cost tracking",
      "Account mini-cards — Cash, UPI, Card balances at a glance",
      "Cash Flow chart — income vs expenses for the last 7 months (area chart)",
      "Spending Breakdown — pie/donut chart of expense categories for the current month",
      "Budget progress bar with alert threshold warning",
      "Level Progress — gamification XP bar showing your level and points",
      "Recent Transactions table — your latest 6 entries",
      "Download Monthly PDF — export everything as a printable report",
    ],
    buttons: [
      "Download Monthly PDF — exports your current month's financial summary",
      "See All (Budget) — navigates to Budget page",
      "See More (Transactions) — navigates to Transactions page",
      "Generate Schedule — opens the schedule planner form",
    ],
    faq: [
      { q: "What does the Total Balance card show?", a: "It shows the sum of all your account balances — cash, UPI, card, and bank. It represents how much money you currently have across all accounts." },
      { q: "What is the Cash Flow chart?", a: "The Cash Flow chart compares your Income (green) vs Expenses (red) over the last 7 months using an area chart. It helps you see trends — are you spending more than earning?" },
      { q: "What does Spending Breakdown show?", a: "It's a donut chart showing how your expenses are split across categories (Food, Transport, Shopping, etc.) for the current month. The center shows total expense." },
      { q: "What is Level Progress?", a: "You earn points by using the app — logging transactions, creating schedules, etc. Points fill up your level bar. Higher levels mean you're being consistent!" },
      { q: "How do I download a PDF?", a: "Click the 'Download Monthly PDF' button at the top of the Dashboard. It generates a printable PDF summarizing your monthly income, expenses, budget, and account balances." },
      { q: "What does the budget progress bar mean?", a: "It shows how much of your monthly budget you've used. Green means you're under budget, amber means you're near your alert threshold, and red means you've exceeded your budget." },
    ],
  },

  "/expense": {
    name: "Expense Tracker",
    purpose: "Your fast, focused expense logging hub. Tap a Quick Category chip to pre-fill common expense types, then enter the amount and hit Log. You can also add income, transfers, and create new accounts — all from one page.",
    keyFeatures: [
      "Quick Category Chips — one-tap pre-fill for Food, Transport, Shopping, Coffee, Phone, Education, Entertainment, Health",
      "Live Balance Header — Total Balance, Income, Expenses, Budget Left at a glance",
      "Transaction Form — add income, expense, or transfer entries with category, date, account, and notes",
      "Recent Activity — see your last 5 transactions immediately to catch errors",
      "Balance Breakdown — Cash, UPI, Card, Bank totals",
      "Budget Progress — visual bar showing how much budget you've used",
      "Inline Account Creation — add new accounts without leaving the page",
    ],
    fields: [
      "Amount (₹) — the transaction value",
      "Account — which account to use for this transaction",
      "Category — what type of expense/income (Food, Transport, Salary, etc.)",
      "Date — when the transaction happened",
      "Note — description of what the expense/income was for",
    ],
    buttons: [
      "Quick Category Chips — tap to pre-fill expense category",
      "Log Expense / Log Income / Transfer — saves the transaction",
      "Add (accounts) — create a new money account inline",
    ],
    faq: [
      { q: "How do I add an expense?", a: "On the Expense page, tap a Quick Category chip (like Food or Transport), enter the amount, select your account, and click 'Log Expense'. Or manually fill the form below." },
      { q: "How do I add income?", a: "Click the 'Income' button in the transaction form, enter the amount, select your account and category, and click 'Log Income'." },
      { q: "What is a transfer?", a: "A transfer moves money from one account to another. For example, transferring ₹500 from your Cash account to your UPI account. Select 'Transfer', choose the 'From' and 'To' accounts." },
      { q: "How do I create a new account?", a: "Click the '+ Add' button in the 'Your Accounts' card on the right side. Enter the account name, type (Cash/UPI/Card/Bank), and balance." },
    ],
  },

  "/accounts": {
    name: "Accounts",
    purpose: "Manage all your money accounts in one place. View, create, and delete accounts. Each account has a type (Cash, UPI, Card, Bank), a name, and a balance. You can set one as your default account.",
    keyFeatures: [
      "View all accounts as cards with emoji icons, name, type badge, balance, and creation date",
      "Add new accounts via the 'Add Account' dialog",
      "Delete accounts you no longer need",
      "Mark one account as default (shown with a star icon)",
    ],
    fields: [
      "Account Name — the display name for the account",
      "Type — Cash 💵, UPI 📱, Card 💳, or Bank 🏦",
      "Opening Balance — how much money is in the account right now",
      "Set as Default — toggle to make this your primary account",
    ],
    buttons: [
      "Add Account — opens the create account dialog",
      "Delete (trash icon) — permanently removes an account",
    ],
    faq: [
      { q: "What is the difference between account types?", a: "Cash = physical money in your wallet. UPI = digital wallets like PhonePe/GPay. Card = credit/debit cards. Bank = savings/current accounts. This helps categorize where your money is." },
      { q: "Can I edit an account after creating it?", a: "Currently you can delete and recreate accounts. The balance updates automatically when you add transactions." },
      { q: "What does the star icon mean?", a: "The star indicates your default account. When you add a quick transaction, the default account is used automatically." },
    ],
  },

  "/transactions": {
    name: "Transactions",
    purpose: "View, search, and filter all your financial activity in one place. Every income, expense, and transfer you've recorded appears here in a detailed table with description, category, account, date, and amount.",
    keyFeatures: [
      "Full transaction table with all entries",
      "Color-coded amounts — green for income, red for expense, blue for transfers",
      "Category badges to quickly see spending types",
      "Account names linked to each transaction",
      "Date sorting and filtering",
    ],
    faq: [
      { q: "How do I find a specific transaction?", a: "Scroll through the table or use browser search (Ctrl+F). Transactions are shown with description, category, account, and date." },
      { q: "What do the colors mean?", a: "Green (+) = income you received. Red (-) = expense you paid. Blue = transfer between your own accounts." },
      { q: "Where do transactions come from?", a: "You add them manually from the 'Enter Application' page or via the receipt scanner. Every entry you make there appears here automatically." },
    ],
  },

  "/budget": {
    name: "Budget",
    purpose: "Set and track your monthly spending limit. See how much you've spent vs. your budget, monitor your savings goal progress, and review monthly insights with rule-based suggestions for next month's adjustments.",
    keyFeatures: [
      "Monthly budget card with large amount display",
      "Progress bar showing % of budget used (green → amber → red)",
      "Remaining balance or overspend amount",
      "Stats grid — Spent, Alert threshold, and Savings Goal",
      "Savings Progress tracker with visual bar",
      "Edit budget button to update amounts",
      "Monthly Review & Insights — automated suggestions based on your spending patterns",
    ],
    fields: [
      "Budget Amount (₹) — your maximum monthly spending",
      "Alert Threshold (%) — warning trigger point (default 80%)",
      "Savings Goal (₹) — target amount to save this month",
    ],
    buttons: [
      "Edit (pencil icon) — opens the budget edit form",
      "Set Budget / Update Budget — saves your budget changes",
    ],
    faq: [
      { q: "What is remaining budget?", a: "Remaining budget = Monthly Budget − Total Expenses. If you set ₹10,000 and spent ₹7,000, your remaining is ₹3,000. If it goes negative, you've overspent." },
      { q: "How does the Monthly Review work?", a: "The system analyzes your spending using rules: if you overspent in any category, it warns you. If you saved well, it congratulates you. It also suggests adjustments like 'reduce food spending' — all without AI, using pure logic." },
      { q: "What happens when I exceed the budget?", a: "The progress bar turns red, and you'll see an 'Over Budget!' alert badge. The insights section will suggest reducing spending in your highest categories." },
      { q: "How is the savings goal tracked?", a: "Projected savings = your remaining budget. If remaining equals or exceeds your savings goal, you'll see a 'Goal Achieved!' badge with a green checkmark." },
    ],
  },

  "/analytics": {
    name: "Analytics",
    purpose: "Visual insights into your financial patterns. See charts, trends, and breakdowns that help you understand where your money goes and how your spending changes over time.",
    keyFeatures: [
      "Expense category breakdown charts",
      "Income vs Expense comparison",
      "Monthly trend analysis",
      "Visual spending patterns",
    ],
    faq: [
      { q: "What can I learn from Analytics?", a: "You can spot patterns like 'I spend most on Food' or 'My income was lower in March'. This helps you make better financial decisions." },
      { q: "Is Analytics data real-time?", a: "Yes, it pulls from the same transaction data you enter. As soon as you add a new transaction, it reflects in the analytics." },
    ],
  },

  "/leaderboard": {
    name: "Leaderboard",
    purpose: "See how you compare against other users! The leaderboard ranks users by points earned through app activities like logging transactions, creating schedules, and maintaining good financial habits.",
    keyFeatures: [
      "User ranking table with avatars",
      "Points display for each user",
      "Level indicators",
      "Your position highlighted",
    ],
    faq: [
      { q: "How do I earn points?", a: "You earn points by: adding transactions (+5), generating daily schedules (+10), completing onboarding (+20), and other app activities. Points help you level up!" },
      { q: "What do levels mean?", a: "Levels represent your consistency in using the app. More points = higher level. It's a gamification feature to keep you motivated." },
    ],
  },

  "/inbox": {
    name: "Inbox",
    purpose: "Read messages and notifications sent from the EduVest Admin. The admin can send announcements, tips, or personalized messages to users.",
    keyFeatures: [
      "List of messages from admin",
      "Read/unread status indicators",
      "Message content display",
      "Timestamps for each message",
    ],
    faq: [
      { q: "Who sends inbox messages?", a: "The EduVest admin sends messages. These could be app announcements, financial tips, or personalized feedback on your spending habits." },
      { q: "Will I get notifications?", a: "Yes, the notification bell in the top bar shows new unread messages. Click it to see them." },
    ],
  },

  "/settings": {
    name: "Settings",
    purpose: "Manage your profile preferences, app settings, and account configuration. You can update your personal information and adjust app behavior.",
    keyFeatures: [
      "Profile information management",
      "Theme preferences (dark/light mode)",
      "App configuration options",
    ],
    faq: [
      { q: "Can I change dark mode?", a: "Yes! Use the sun/moon toggle button in the top-right of the navbar. Your preference is saved and persists across sessions." },
      { q: "How do I edit my profile?", a: "Go to Settings page to update your profile information. You can also click your avatar in the top-right corner for account options." },
    ],
  },

  "/schedule": {
    name: "Schedule",
    purpose: "Your manual, rule-based weekly planner. Enter your routine details (wake/sleep times, classes, gym, meals, budget) and the app generates a structured daily and weekly schedule for you. No AI — pure logic.",
    keyFeatures: [
      "Routine Input Form — enter wake/sleep times, class hours, gym, meals, transport, budget, study hours, and weekend preference",
      "Weekly overview — 7 day-cards (Mon–Sun) showing day type, date, and completion progress",
      "Detailed day view — click any day to see the full timeline with task cards",
      "Task completion — click the circle next to any task to mark it done",
      "Gamification — completing all tasks in a day awards +15 points",
      "Day types — Focus Day, Class Day, Balanced Day, Recovery Day, Revision Day, Flexible Day, Rest Day",
      "Budget tracking — each schedule block can have a cost, and daily total is displayed",
      "Weekday vs Weekend variation — weekends are lighter based on your preference",
    ],
    fields: [
      "Wake Up Time — when you start your day",
      "Sleep Time — when you go to bed",
      "Class/Work Time — start and end of classes or work",
      "Study Hours — how many hours of study per day",
      "Gym Time & Duration — workout schedule",
      "Monthly Budget & Meal Budget — for cost tracking per block",
      "Transport Mode & Cost — commute details",
      "Focus Preference — morning/afternoon/evening person",
      "Weekend Preference — rest / light-study / productive / mixed",
    ],
    buttons: [
      "Edit Routine — opens the routine input form to change inputs",
      "Generate Weekly Schedule — creates Mon–Sun schedule from your routine",
      "Task checkboxes — toggle completion on individual blocks",
    ],
    faq: [
      { q: "How is the schedule generated?", a: "It uses your routine inputs (wake time, class times, gym schedule, etc.) and applies rules: fixed tasks stay locked, meals at your specified times, study sessions fill free slots, breaks inserted naturally. Weekdays are heavier, weekends lighter. No AI — pure rule-based logic." },
      { q: "What is my plan today?", a: "Open the Schedule page and click today's date card (highlighted with a ring). You'll see all tasks for today with times, icons, and costs. You can also see a summary on the Dashboard." },
      { q: "How do I complete a task?", a: "Click the circle next to any task to mark it as done. When you complete ALL tasks in a day, you earn +15 gamification points!" },
      { q: "Can I edit my routine?", a: "Yes! Click the 'Edit Routine' button at the top of the Schedule page. Update your times, preferences, or budget, then click 'Generate Weekly Schedule' to refresh." },
      { q: "Why is study in the evening?", a: "Study placement depends on your Focus Preference. If you chose 'evening', study blocks are placed after classes. Change it to 'morning' to move them earlier." },
      { q: "What are day types?", a: "Each day is assigned a type: Focus Day (heavy study), Class Day (lecture-heavy), Balanced Day (mix), Recovery Day (light weekend), Revision Day (Saturday review), Flexible Day, Rest Day (Sunday)." },
      { q: "Does the schedule connect to budget?", a: "Yes! Each block can have a cost (meals, transport). The daily total is shown at the bottom of each day, and it's derived from your monthly budget divided by 30." },
    ],
  },

  "/onboarding": {
    name: "Onboarding",
    purpose: "The first-time setup wizard that helps new users configure their profile, set initial preferences, and understand the app's core features.",
    keyFeatures: [
      "Step-by-step guided setup",
      "Profile creation",
      "Initial budget and account setup",
      "Feature introduction tour",
    ],
    faq: [
      { q: "Do I have to complete onboarding?", a: "Yes, the app redirects you to onboarding until you finish it. It ensures your profile is set up correctly for the best experience." },
    ],
  },
};

// ─── Response Templates ─────────────────────────────────────

const RESPONSES: Record<string, string[]> = {
  [INTENTS.GREETING]: [
    "Hello! 👋 I'm your Smart Assistant. I know everything about this app — from budgets to schedules to every page and button. What would you like to know?",
    "Hi there! I'm here to help you navigate EduVest. Ask me about any page, feature, button, or form field — I know them all!",
  ],
  [INTENTS.THANK_YOU]: [
    "You're welcome! Happy to help. If you have more questions, just ask! 😊",
    "Glad I could help! Don't hesitate to ask anything else about the app.",
  ],
  [INTENTS.GOODBYE]: [
    "Bye! Come back anytime you need help with your budget or schedule. Take care! 👋",
    "See you later! Remember to log your expenses regularly. Goodbye! 😊",
  ],
  [INTENTS.ASK_APP_INTRO]: [
    "EduVest is a complete student finance & productivity app. Here's what it offers:\n\n📊 **Dashboard** — See all your financial stats at a glance\n💰 **Budget** — Set monthly spending limits and savings goals\n📝 **Enter Application** — Log income, expenses, and transfers\n🏦 **Accounts** — Manage wallets, UPI, cards, and banks\n📈 **Analytics** — Visual insights into spending patterns\n📅 **Schedule** — Generate smart daily routines\n🏆 **Leaderboard** — Compete with other users\n📬 **Inbox** — Get messages from admin\n\nEverything runs 100% locally — no AI APIs needed!",
  ],
  [INTENTS.ASK_FEATURE]: [
    "Here are the main features:\n\n1. **Multi-account management** — Cash, UPI, Card, Bank\n2. **Budget tracking** — Set limits, get alerts, track savings\n3. **Transaction logging** — Income, expense, transfers with categories\n4. **Smart Daily Planner** — Manual schedule based on your routine\n5. **Monthly Review** — Rule-based insights and next-month suggestions\n6. **Analytics** — Charts and spending breakdowns\n7. **Gamification** — Earn points and level up\n8. **PDF Export** — Download monthly reports\n9. **Receipt Scanner** — Auto-fill from payment receipts\n\nWhat would you like to explore?",
  ],
  [INTENTS.ASK_NAVIGATION]: [
    "Here's where to find everything:\n\n📊 Dashboard → /dashboard (main overview)\n📅 Schedule → /schedule (daily & weekly planner)\n📝 Enter Data → /enter-application (add accounts, budget, transactions)\n🏦 Accounts → /accounts (manage money accounts)\n💳 Transactions → /transactions (view all entries)\n💰 Budget → /budget (set spending limits)\n📈 Analytics → /analytics (spending charts)\n🏆 Leaderboard → /leaderboard (rankings)\n📬 Inbox → /inbox (admin messages)\n⚙️ Settings → /settings (profile & preferences)\n\nUse the sidebar on the left to navigate!",
  ],
  [INTENTS.ASK_FORM_HELP]: [
    "On the Enter Application page, you'll fill these forms:\n\n**Accounts tab:**\n• Account Name — a friendly name (e.g., 'My Wallet')\n• Type — Cash/UPI/Card/Bank\n• Opening Balance — current money in the account\n• Set as Default — makes it the primary account\n\n**Budget tab:**\n• Monthly Budget — your spending cap\n• Alert Threshold — warns you at this % (default 80%)\n• Savings Goal — target amount to save\n\n**Transactions tab:**\n• Type — Income/Expense/Transfer\n• Amount — how much\n• Account — which wallet to use\n• Category — what it's for\n• Date & Note — when and why",
  ],
  [INTENTS.ASK_BUDGET_HELP]: [
    "To create or update your budget:\n\n1. Go to **Enter Application** → **Budget tab**\n2. Enter your **Monthly Budget** amount (e.g., ₹10,000)\n3. Set the **Alert Threshold** (default 80%)\n4. Add a **Savings Goal** (optional but recommended)\n5. Click **Set Budget**\n\nYou can also manage your budget on the dedicated **Budget page** from the sidebar. There you'll see a detailed progress bar, savings tracking, and monthly review insights.",
  ],
  [INTENTS.ASK_REMAINING]: [
    "**Remaining Budget** = Monthly Budget − Total Expenses this month.\n\nFor example: If budget is ₹10,000 and you've spent ₹7,000 → Remaining = ₹3,000.\n\nYou can check this on:\n• **Dashboard** → Budget card (mini view)\n• **Budget page** → Full detailed view with progress bar\n\nIf remaining goes negative, you're over budget and will see a red warning!",
  ],
  [INTENTS.ASK_SCHEDULE_HELP]: [
    "The Schedule page creates your personalized weekly plan:\n\n1. Go to **Schedule** page (sidebar)\n2. Click **Edit Routine** and fill in:\n   • Wake/Sleep times, Class hours, Gym, Meals\n   • Study hours, Transport, Budget, Weekend preference\n3. Click **Generate Weekly Schedule**\n\n**Key features:**\n• 7-day weekly overview with day-type badges\n• Click any day to see full detailed timeline\n• Check off tasks as you complete them\n• Complete ALL tasks in a day → earn +15 points!\n• Daily cost tracking tied to your monthly budget\n• Weekday/weekend variation built-in\n\nYour today's schedule also appears as a card on the **Dashboard**!\n\nNo AI involved — pure rule-based logic.",
  ],
  [INTENTS.ASK_MONTHLY_REVIEW]: [
    "The Monthly Review appears on the **Budget page** below your main budget card. It runs automatically when you have a budget and transactions.\n\nWhat it does:\n• Checks if you're over budget → warns you\n• Checks if savings goal is met → congratulates you\n• Finds your highest spending category → suggests reduction\n• Gives routine adjustment tips\n\nAll suggestions are rule-based logic, not AI. For example: 'If Food > 40% of budget → recommend reducing food spending next month.'",
  ],
  [INTENTS.ASK_TRANSACTION]: [
    "To add an expense or income:\n\n1. Go to **Enter Application** (sidebar) → **Transactions tab**\n2. Choose: **Income**, **Expense**, or **Transfer**\n3. Enter the **Amount**\n4. Select your **Account** (Cash/UPI/Card/Bank)\n5. Choose a **Category** (Food, Transport, Salary, etc.)\n6. Pick the **Date** and add a **Note**\n7. Click **Add Transaction**\n\nYour transaction immediately updates your account balance, budget progress, and dashboard stats!",
  ],
  [INTENTS.ASK_DASHBOARD_HELP]: [
    "The Dashboard shows everything at a glance:\n\n**Top row:** 4 stat cards\n• Total Balance — sum of all accounts\n• Monthly Income — income this month\n• Monthly Expenses — expenses this month\n• Monthly Budget — your spending limit with usage %\n\n**Middle:** Smart Daily Planner with timeline cards\n\n**Account row:** Cash, UPI, Card individual balances\n\n**Charts:** Cash Flow (7-month trend) + Spending Breakdown (category pie)\n\n**Bottom:** Recent transactions table (last 6 entries)\n\n**Right sidebar:** Level progress + budget panel",
  ],
  [INTENTS.ASK_PROFILE_HELP]: [
    "Your profile can be managed from:\n\n• **Settings page** — update personal info and preferences\n• **User avatar** (top-right corner) — click for account options, sign-out\n• **Onboarding** — initial setup done during first login\n\nYour points and level are shown on the Dashboard and in the navbar (⭐ badge).",
  ],
  [INTENTS.ASK_ACCOUNT_HELP]: [
    "Accounts represent where your money lives:\n\n**Types:**\n• 💵 Cash — physical wallet money\n• 📱 UPI — digital wallets (PhonePe, GPay, etc.)\n• 💳 Card — credit or debit cards\n• 🏦 Bank — savings or current bank accounts\n\n**To create:** Go to Accounts page → Add Account → fill name, type, balance → Create\n\n**To delete:** Click the trash icon on any account card\n\n**Default account** (star icon) is used for quick transactions automatically.",
  ],
  [INTENTS.ASK_ANALYTICS_HELP]: [
    "The Analytics page shows visual insights:\n\n• Expense category breakdowns (bar/pie charts)\n• Income vs Expense comparisons\n• Monthly trend analysis\n• Spending pattern identification\n\nAll data comes from your transactions — the more entries you add, the richer the insights become!",
  ],
  [INTENTS.ASK_LEADERBOARD]: [
    "The Leaderboard ranks all users by points:\n\n**How to earn points:**\n• +5 points — logging a transaction\n• +20 points — generating a weekly schedule\n• +15 points — completing all tasks in a day\n• +20 points — completing onboarding\n\nYour level increases as you earn more points. It gamifies good financial habits! Check your current level on the Dashboard.",
  ],
  [INTENTS.ASK_INBOX]: [
    "Your Inbox contains messages from the EduVest admin:\n\n• Announcements about app updates\n• Financial tips and advice\n• Personalized feedback on your spending\n\nThe notification bell 🔔 in the navbar shows unread messages. Click it to see new messages, or visit the Inbox page from the sidebar.",
  ],
  [INTENTS.ASK_ENTER_APP]: [
    "The **Expense** page is your fast transaction logging hub!\n\n**Quick Category Chips** — Tap Food, Transport, Shopping etc. to pre-fill the form\n**Transaction Form** — Log income, expenses, or transfers\n**Recent Activity** — See your last 5 transactions\n\nOn the right side:\n• Balance Breakdown — Cash, UPI, Card, Bank totals\n• Budget Progress — see how much you've spent\n• Your Accounts — manage and create accounts inline\n\nThis is where you do most of your data entry!",
  ],
  [INTENTS.ASK_SETTINGS]: [
    "On the Settings page you can:\n\n• Update your profile information\n• Change app preferences\n• Manage your account configuration\n\nFor **dark mode**, use the sun/moon toggle button in the top-right navbar. Your theme preference is saved automatically!",
  ],
  [INTENTS.ASK_PAGE_EXPLAIN]: [
    "I'll explain the page you're currently on! Let me check...",
  ],
  [INTENTS.UNKNOWN]: [
    "I can help with many things! Try asking me about:\n\n💰 Budget — \"How do I create a budget?\"\n📅 Schedule — \"Plan my day\"\n📝 Transactions — \"Where do I add expenses?\"\n📊 Dashboard — \"What do stat cards show?\"\n🔍 Navigation — \"Where do I find analytics?\"\n📄 Any page — \"What is this page?\"\n\nOr ask about any specific feature or button!",
    "Hmm, I didn't quite catch that. I know everything about this app! Ask me about any page, feature, button, or form — I'll explain it in detail.",
  ],
};

// ─── Engine Logic ───────────────────────────────────────────

export function detectIntent(message: string): string {
  const normalized = message.toLowerCase().trim();

  let matchedIntent: string = INTENTS.UNKNOWN;
  let maxScore = 0;

  for (const mapping of KEYWORD_MAP) {
    let score = 0;
    for (const kw of mapping.keywords) {
      if (normalized.includes(kw)) {
        // Longer keywords get higher weight
        score += kw.split(" ").length;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedIntent = mapping.intent;
    }
  }

  return matchedIntent;
}

function getRandomResponse(intent: string): string {
  const options = RESPONSES[intent] || RESPONSES[INTENTS.UNKNOWN];
  return options[Math.floor(Math.random() * options.length)];
}

function getPageExplanation(path: string): string | null {
  // Find matching page knowledge
  const pageKey = Object.keys(PAGE_KNOWLEDGE).find(p => path.startsWith(p));
  if (!pageKey) return null;

  const page = PAGE_KNOWLEDGE[pageKey];
  let response = `📍 You're on the **${page.name}** page.\n\n**Purpose:** ${page.purpose}\n\n**Key Features:**\n`;
  response += page.keyFeatures.map(f => `• ${f}`).join("\n");

  if (page.buttons && page.buttons.length > 0) {
    response += "\n\n**Buttons:**\n" + page.buttons.map(b => `• ${b}`).join("\n");
  }

  return response;
}

function getPageFAQ(path: string, question: string): string | null {
  const pageKey = Object.keys(PAGE_KNOWLEDGE).find(p => path.startsWith(p));
  if (!pageKey) return null;

  const page = PAGE_KNOWLEDGE[pageKey];
  const normalizedQ = question.toLowerCase();

  // Try to match FAQ by keyword overlap — require at least 3 meaningful words
  // to avoid false matches (e.g. "give me a schedule" matching a PDF FAQ)
  const STOP_WORDS = ["a", "the", "is", "do", "i", "my", "me", "how", "what", "can", "to", "in", "of", "and", "or", "it"];
  for (const faq of page.faq) {
    const faqWords = faq.q.toLowerCase().split(" ").filter(w => !STOP_WORDS.includes(w) && w.length > 2);
    const matchCount = faqWords.filter(w => normalizedQ.includes(w)).length;
    // Require at least 3 meaningful keyword matches for a FAQ hit
    if (matchCount >= 3) {
      return `**Q: ${faq.q}**\n\n${faq.a}`;
    }
  }

  return null;
}

export async function chatWithAssistant(message: string, currentPath: string): Promise<string> {
  // Simulate response delay for natural feel
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400));

  const lowerMsg = message.toLowerCase().trim();

  // 1. Check for page explanation request FIRST
  if (lowerMsg.includes("what is this page") || lowerMsg.includes("where am i") || lowerMsg.includes("what do i do here") || lowerMsg.includes("explain this page") || lowerMsg.includes("current page")) {
    const explanation = getPageExplanation(currentPath);
    if (explanation) return explanation;
  }

  // 2. Detect global intent BEFORE page FAQ to avoid false matches
  //    e.g. "give me a study schedule" should go to SCHEDULE_HELP, not a random dashboard FAQ
  const intent = detectIntent(message);

  // 3. If a strong global intent was found (not UNKNOWN), use it directly
  if (intent !== INTENTS.UNKNOWN && intent !== INTENTS.ASK_PAGE_EXPLAIN) {
    return getRandomResponse(intent);
  }

  // 4. If intent is unknown, try page-specific FAQ as fallback
  const faqMatch = getPageFAQ(currentPath, message);
  if (faqMatch) return faqMatch;

  // 5. Check if asking about a SPECIFIC page by name
  for (const [path, page] of Object.entries(PAGE_KNOWLEDGE)) {
    const pageName = page.name.toLowerCase();
    if (lowerMsg.includes(pageName) && (lowerMsg.includes("what is") || lowerMsg.includes("explain") || lowerMsg.includes("about") || lowerMsg.includes("help") || lowerMsg.includes("how"))) {
      let response = `📍 **${page.name}**\n\n**Purpose:** ${page.purpose}\n\n**Key Features:**\n`;
      response += page.keyFeatures.map(f => `• ${f}`).join("\n");
      if (page.fields) {
        response += "\n\n**Fields you can fill:**\n" + page.fields.slice(0, 5).map(f => `• ${f}`).join("\n");
      }
      return response;
    }
  }

  // 6. Page explain fallback
  if (intent === INTENTS.ASK_PAGE_EXPLAIN) {
    const explanation = getPageExplanation(currentPath);
    if (explanation) return explanation;
    return "I'm not sure which page you're on. Try navigating to a page from the sidebar and ask again!";
  }

  return getRandomResponse(INTENTS.UNKNOWN);
}
