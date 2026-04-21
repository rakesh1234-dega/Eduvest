/**
 * Gemini AI Client & Manual Fallback Logic
 * 
 * This file handles both AI-powered schedule generation and a robust "Manual Mode"
 * for when API keys are missing or quotas are exceeded.
 */

// ─── Types ──────────────────────────────────────────────────

export interface DailyDetails {
  monthlyBudget: number;
  transportMode: string;
  transportCost: number;
  breakfastPref: string;
  lunchPref: string;
  dinnerPref: string;
  gymTime: string;
  proteinPref: string;
  goals: string;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  cost: number;
  details: string;
  type: "transport" | "food" | "gym" | "other";
}

const API_BASE = "/api/ai";

// ─── AI API Calls (with Proxy Support) ──────────────────────

async function aiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `AI request failed (${res.status})`);
  return data;
}

/** 
 * Generates schedule using Gemini AI (via backend proxy)
 */
export async function generateSchedule(details: DailyDetails): Promise<ScheduleItem[]> {
  try {
    const data = await aiPost<{ schedule: ScheduleItem[] }>("/schedule", details);
    return data.schedule;
  } catch (err) {
    console.warn("AI generation failed, falling back to manual logic:", err);
    return generateManualSchedule(details);
  }
}

/**
 * General chat with Gemini AI (via backend proxy)
 */
export async function chatWithAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const data = await aiPost<{ response: string }>("/chat", { messages });
    return data.response;
  } catch (err) {
    console.warn("AI chat failed, using offline response mode:", err);
    return getOfflineResponse(messages[messages.length - 1].content);
  }
}

// ─── Manual (AI-Less) Generation Logic ──────────────────────

/**
 * Creates a personalized schedule without any API calls.
 * Uses the user's budget and preferences to build a realistic timeline.
 */
export function generateManualSchedule(details: DailyDetails): ScheduleItem[] {
  const dailyLimit = Math.round(details.monthlyBudget / 30);
  const items: ScheduleItem[] = [];

  // 1. Breakfast
  items.push({
    time: "7:30 AM",
    activity: "Morning Fuel: " + details.breakfastPref,
    cost: Math.min(60, Math.floor(dailyLimit * 0.15)),
    details: `Start your day with ${details.breakfastPref}. High energy, low cost.`,
    type: "food"
  });

  // 2. Transport (Morning)
  items.push({
    time: "8:30 AM",
    activity: `Commute (${details.transportMode})`,
    cost: details.transportCost,
    details: `Heading to your morning session using ${details.transportMode}.`,
    type: "transport"
  });

  // 3. Morning Session
  items.push({
    time: "9:00 AM",
    activity: "Productive Study/Work",
    cost: 0,
    details: "Focus block: Work on your primary goal: " + details.goals,
    type: "other"
  });

  // 4. Lunch
  items.push({
    time: "1:00 PM",
    activity: "Student Lunch: " + details.lunchPref,
    cost: Math.min(100, Math.floor(dailyLimit * 0.25)),
    details: `Enjoy a nutritious serving of ${details.lunchPref}. Stay hydrated!`,
    type: "food"
  });

  // 5. Afternoon Focus
  items.push({
    time: "2:30 PM",
    activity: "Skill Development",
    cost: 0,
    details: "Continue working towards your goal. No spending required here.",
    type: "other"
  });

  // 6. Evening Snack
  items.push({
    time: "4:30 PM",
    activity: "Light Refreshment",
    cost: Math.min(30, Math.floor(dailyLimit * 0.1)),
    details: "A quick tea or snack to keep the brain sharp.",
    type: "food"
  });

  // 7. Activity/Gym (User Choice)
  items.push({
    time: details.gymTime || "6:00 PM",
    activity: "Active Block: " + (details.proteinPref ? `Gym + ${details.proteinPref}` : "Exercise"),
    cost: details.proteinPref ? 40 : 0,
    details: "Health is wealth. Time for some physical activity.",
    type: "gym"
  });

  // 8. Dinner
  items.push({
    time: "8:30 PM",
    activity: "Evening Meal: " + details.dinnerPref,
    cost: Math.min(80, Math.floor(dailyLimit * 0.2)),
    details: `Closing the day with ${details.dinnerPref}. Keep it light for better sleep.`,
    type: "food"
  });

  return items;
}

/**
 * Provides helpful offline responses when AI is unavailable.
 */
function getOfflineResponse(message: string): string {
  const input = message.toLowerCase();
  
  if (input.includes("hello") || input.includes("hi")) {
    return "Hi there! I'm your Student Budget Buddy. I'm currently in 'Offline Mode' (no API key detected), but I can still help you generate schedules if you fill out the form!";
  }
  
  if (input.includes("budget") || input.includes("save")) {
    return "To save money, try to limit your non-essential spending. Use our AI (or Manual) planner to track your daily limit!";
  }
  
  return "I'm currently in Offline Mode. For best results, use the 'Smart Planner' on your dashboard to create your daily schedule!";
}
