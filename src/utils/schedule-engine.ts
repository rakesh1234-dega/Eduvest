/**
 * Manual Schedule Engine Logic
 * Completely bypasses AI to build realistic schedules based on time, budget, and day patterns.
 */

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

export async function generateManualScheduleEngine(details: DailyDetails): Promise<ScheduleItem[]> {
  // Simulate AI thought process delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const dailyLimit = Math.round(details.monthlyBudget / 30);
  const items: ScheduleItem[] = [];
  
  // Create variations based on day of week
  const dayOfWeek = new Date().getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHeavyStudy = dayOfWeek === 1 || dayOfWeek === 3; // Mon, Wed

  // 1. Breakfast
  const wakeTime = isWeekend ? "9:00 AM" : "7:30 AM";
  items.push({
    time: wakeTime,
    activity: "Morning Fuel: " + (details.breakfastPref || "Healthy Start"),
    cost: Math.min(60, Math.floor(dailyLimit * 0.15)),
    details: `Start your day with ${details.breakfastPref}. Energy is essential for focus.`,
    type: "food"
  });

  if (!isWeekend) {
    // 2. Transport (Morning)
    items.push({
      time: "8:30 AM",
      activity: `Commute (${details.transportMode || 'Walk'})`,
      cost: details.transportCost || 0,
      details: `Heading to your morning session using ${details.transportMode}.`,
      type: "transport"
    });

    // 3. Morning Session
    items.push({
      time: "9:00 AM",
      activity: isHeavyStudy ? "Deep Work & Study Block" : "Classes / Group Work",
      cost: 0,
      details: "Focus on your primary goal: " + details.goals,
      type: "other"
    });
  } else {
    // Weekend morning block
    items.push({
      time: "10:00 AM",
      activity: "Weekend Review & Planning",
      cost: 0,
      details: "Review the past week's budget and plan for the next. Great habit!",
      type: "other"
    });
  }

  // 4. Lunch
  const lunchTime = isWeekend ? "1:30 PM" : "1:00 PM";
  items.push({
    time: lunchTime,
    activity: "Recharge Lunch: " + (details.lunchPref || "Balanced Meal"),
    cost: Math.min(100, Math.floor(dailyLimit * 0.25)),
    details: `Enjoy a nutritious serving of ${details.lunchPref}. Try not to overindulge inside budget limit.`,
    type: "food"
  });

  // 5. Afternoon Focus
  if (!isWeekend) {
    items.push({
      time: "2:30 PM",
      activity: isHeavyStudy ? "Skill Development" : "Light Review & Assignments",
      cost: 0,
      details: "Continue working towards your goal. Time blocking helps productivity.",
      type: "other"
    });
  } else {
    items.push({
      time: "3:00 PM",
      activity: "Personal Projects / Flex Time",
      cost: 0,
      details: "Use this time for hobbies or hanging out. Keep it within budget!",
      type: "other"
    });
  }

  // 6. Evening Snack
  items.push({
    time: "4:30 PM",
    activity: "Light Refreshment",
    cost: Math.min(30, Math.floor(dailyLimit * 0.1)),
    details: "A quick snack to keep the brain sharp before physical activity.",
    type: "food"
  });

  // 7. Activity/Gym (User Choice)
  items.push({
    time: details.gymTime || "6:00 PM",
    activity: "Active Block: " + (details.proteinPref ? `Gym + ${details.proteinPref}` : "Exercise / Stretch"),
    cost: details.proteinPref ? 40 : 0,
    details: "Health is wealth. Daily physical movement.",
    type: "gym"
  });

  // 8. Dinner
  const dinnerTime = isWeekend ? "9:00 PM" : "8:30 PM";
  items.push({
    time: dinnerTime,
    activity: "Evening Clean Meal: " + (details.dinnerPref || "Light Dinner"),
    cost: Math.min(80, Math.floor(dailyLimit * 0.2)),
    details: `Closing the day with ${details.dinnerPref}. Digestion friendly for better sleep.`,
    type: "food"
  });

  return items;
}
