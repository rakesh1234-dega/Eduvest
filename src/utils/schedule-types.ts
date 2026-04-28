/**
 * Schedule Type Definitions
 */

export interface RoutineInput {
  wakeUpTime: string;      // "6:00 AM"
  sleepTime: string;       // "10:30 PM"
  classTime: string;       // "9:00 AM"
  classEndTime: string;    // "12:30 PM"
  studyHours: number;      // 3
  gymTime: string;         // "6:00 PM"
  gymDuration: number;     // 60 (minutes)
  breakfastTime: string;   // "7:30 AM"
  lunchTime: string;       // "1:00 PM"
  dinnerTime: string;      // "8:30 PM"
  travelTime: number;      // 30 (minutes)
  breakDuration: number;   // 15 (minutes)
  focusPreference: "morning" | "afternoon" | "evening";
  personalTasks: string;   // free text
  fixedTasks: string;      // free text
  flexibleTasks: string;   // free text
  weekendPreference: "rest" | "light-study" | "productive" | "mixed";
  monthlyBudget: number;
  transportMode: string;
  transportCost: number;
  mealBudget: number;
}

export interface ScheduleBlock {
  time: string;
  endTime: string;
  activity: string;
  category: "wake" | "meal" | "class" | "study" | "gym" | "travel" | "break" | "personal" | "sleep" | "review";
  icon: string;            // emoji
  cost: number;
  completed: boolean;
  actualCost?: number;
  verificationNote?: string;
  completedAt?: string;
}

export type DayType = "Focus Day" | "Class Day" | "Balanced Day" | "Recovery Day" | "Revision Day" | "Flexible Day" | "Rest Day";

export interface DaySchedule {
  date: string;            // "2026-04-21"
  dayOfWeek: number;       // 0=Sun, 6=Sat
  dayName: string;         // "Monday"
  dayType: DayType;
  blocks: ScheduleBlock[];
  totalCost: number;
}

export interface WeekSchedule {
  days: DaySchedule[];
  weekStart: string;
  generatedAt: string;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const CATEGORY_COLORS: Record<ScheduleBlock["category"], string> = {
  wake:     "bg-amber-50 text-amber-600 border-amber-200",
  meal:     "bg-orange-50 text-orange-600 border-orange-200",
  class:    "bg-blue-50 text-blue-600 border-blue-200",
  study:    "bg-indigo-50 text-indigo-600 border-indigo-200",
  gym:      "bg-emerald-50 text-emerald-600 border-emerald-200",
  travel:   "bg-slate-50 text-slate-600 border-slate-200",
  break:    "bg-sky-50 text-sky-600 border-sky-200",
  personal: "bg-purple-50 text-purple-600 border-purple-200",
  sleep:    "bg-violet-50 text-violet-600 border-violet-200",
  review:   "bg-teal-50 text-teal-600 border-teal-200",
};

export const CATEGORY_ICONS: Record<ScheduleBlock["category"], string> = {
  wake:     "☀️",
  meal:     "🍽️",
  class:    "📚",
  study:    "✏️",
  gym:      "💪",
  travel:   "🚌",
  break:    "☕",
  personal: "🎯",
  sleep:    "🌙",
  review:   "📝",
};

export const DEFAULT_ROUTINE: RoutineInput = {
  wakeUpTime: "6:00 AM",
  sleepTime: "10:30 PM",
  classTime: "9:00 AM",
  classEndTime: "12:30 PM",
  studyHours: 3,
  gymTime: "6:00 PM",
  gymDuration: 60,
  breakfastTime: "7:30 AM",
  lunchTime: "1:00 PM",
  dinnerTime: "8:30 PM",
  travelTime: 30,
  breakDuration: 15,
  focusPreference: "morning",
  personalTasks: "",
  fixedTasks: "",
  flexibleTasks: "",
  weekendPreference: "mixed",
  monthlyBudget: 5000,
  transportMode: "Bus",
  transportCost: 20,
  mealBudget: 150,
};
