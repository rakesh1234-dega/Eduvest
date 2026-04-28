/**
 * Schedule Rules Engine
 * Generates realistic, varied daily and weekly schedules from user routine inputs.
 * 100% manual, rule-based — no AI.
 */

import { supabase } from "@/integrations/supabase/client";
import {
  RoutineInput, ScheduleBlock, DaySchedule, DayType, WeekSchedule,
  DAY_NAMES, CATEGORY_ICONS,
} from "./schedule-types";

// ─── Day Type Assignment ────────────────────────────────────

function assignDayType(dayOfWeek: number, input: RoutineInput): DayType {
  // 0=Sun, 6=Sat
  if (dayOfWeek === 0) {
    return input.weekendPreference === "rest" ? "Rest Day" : "Recovery Day";
  }
  if (dayOfWeek === 6) {
    return input.weekendPreference === "productive" ? "Revision Day" : "Flexible Day";
  }
  // Weekdays
  const types: DayType[] = ["Focus Day", "Class Day", "Balanced Day", "Focus Day", "Balanced Day"];
  return types[dayOfWeek - 1] || "Balanced Day";
}

// ─── Build a Single Day Schedule ────────────────────────────

export function generateDaySchedule(input: RoutineInput, date: Date): DaySchedule {
  const dayOfWeek = date.getDay();
  const dayType = assignDayType(dayOfWeek, input);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const blocks: ScheduleBlock[] = [];
  const mealCost = Math.round(input.mealBudget / 3);

  // Helper
  const addBlock = (
    time: string, endTime: string, activity: string,
    category: ScheduleBlock["category"], cost = 0
  ) => {
    blocks.push({
      time, endTime, activity, category,
      icon: CATEGORY_ICONS[category], cost, completed: false,
    });
  };

  // ── Wake Up ──
  const wakeTime = isWeekend ? shiftTime(input.wakeUpTime, 60) : input.wakeUpTime;
  addBlock(wakeTime, shiftTime(wakeTime, 30), "Wake Up & Fresh", "wake");

  // ── Breakfast ──
  const bfTime = isWeekend ? shiftTime(input.breakfastTime, 60) : input.breakfastTime;
  addBlock(bfTime, shiftTime(bfTime, 30), "Breakfast", "meal", mealCost);

  if (!isWeekend) {
    // ── Travel to Class ──
    if (input.travelTime > 0) {
      const travelStart = shiftTime(input.classTime, -input.travelTime);
      addBlock(travelStart, input.classTime, `Commute (${input.transportMode})`, "travel", input.transportCost);
    }

    // ── Class / Work ──
    addBlock(input.classTime, input.classEndTime, "Classes / Work", "class");
  } else {
    // Weekend morning — flexible
    if (dayType === "Revision Day") {
      addBlock("10:00 AM", "12:00 PM", "Revision Session", "study");
    } else if (dayType === "Rest Day") {
      addBlock("10:00 AM", "11:30 AM", "Personal Time", "personal");
    } else {
      addBlock("10:00 AM", "11:30 AM", "Light Reading / Hobbies", "personal");
    }
  }

  // ── Lunch ──
  const lunchTime = isWeekend ? shiftTime(input.lunchTime, 30) : input.lunchTime;
  addBlock(lunchTime, shiftTime(lunchTime, 45), "Lunch", "meal", mealCost);

  // ── Afternoon Study / Focus ──
  if (!isWeekend || dayType === "Revision Day" || input.weekendPreference === "productive") {
    const studyStart = shiftTime(lunchTime, 60);
    const studyMins = isWeekend ? 90 : input.studyHours * 60 / 2;
    addBlock(studyStart, shiftTime(studyStart, studyMins), getStudyLabel(dayType), "study");

    // Break after study
    const breakStart = shiftTime(studyStart, studyMins);
    addBlock(breakStart, shiftTime(breakStart, input.breakDuration), "Break", "break");

    // Second study block (weekdays only for Focus/Class days)
    if (!isWeekend && (dayType === "Focus Day" || dayType === "Class Day")) {
      const study2Start = shiftTime(breakStart, input.breakDuration);
      addBlock(study2Start, shiftTime(study2Start, 90), "Deep Study / Practice", "study");
    }
  } else {
    // Weekend non-study block
    const personalStart = shiftTime(lunchTime, 60);
    addBlock(personalStart, shiftTime(personalStart, 120), "Free Time / Personal Projects", "personal");
  }

  // ── Gym ──
  if (!isWeekend || dayOfWeek === 6) { // Gym on weekdays + Saturday
    addBlock(input.gymTime, shiftTime(input.gymTime, input.gymDuration), "Gym / Workout", "gym");
  }

  // ── Dinner ──
  addBlock(input.dinnerTime, shiftTime(input.dinnerTime, 45), "Dinner", "meal", mealCost);

  // ── Evening Wind Down ──
  const eveningStart = shiftTime(input.dinnerTime, 60);
  if (dayType === "Focus Day") {
    addBlock(eveningStart, shiftTime(eveningStart, 60), "Evening Review", "review");
  } else if (dayType === "Balanced Day") {
    addBlock(eveningStart, shiftTime(eveningStart, 45), "Light Reading / Relax", "personal");
  } else {
    addBlock(eveningStart, shiftTime(eveningStart, 45), "Free Time", "personal");
  }

  // ── Sleep Prep ──
  addBlock(shiftTime(input.sleepTime, -30), input.sleepTime, "Sleep Prep", "sleep");

  // Sort by time
  blocks.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

  const totalCost = blocks.reduce((sum, b) => sum + b.cost, 0);

  return {
    date: formatDate(date),
    dayOfWeek,
    dayName: DAY_NAMES[dayOfWeek],
    dayType,
    blocks,
    totalCost,
  };
}

// ─── Build Full Week ────────────────────────────────────────

export function generateWeekSchedule(input: RoutineInput): WeekSchedule {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Go to this Monday

  const days: DaySchedule[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(generateDaySchedule(input, d));
  }

  return {
    days,
    weekStart: formatDate(monday),
    generatedAt: new Date().toISOString(),
  };
}

// ─── Cloud Sync Helpers ─────────────────────────────────────

// Fetches the latest schedule from Supabase and saves to local storage
export async function syncScheduleFromCloud(userId: string): Promise<WeekSchedule | null> {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("schedules")
      .select("content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Schedule cloud sync SELECT error:", error.message, error.code);
      return null;
    }
    if (!data) {
      console.log("Schedule cloud sync: No schedule found for user", userId);
      return null;
    }
    
    const week: WeekSchedule = JSON.parse(data.content);
    
    // Update local cache
    const key = `eduvest_week_schedule_${userId}`;
    localStorage.setItem(key, data.content);
    window.dispatchEvent(new CustomEvent("schedule-updated", { detail: week }));
    console.log("Schedule synced from cloud successfully");
    return week;
  } catch (err) {
    console.error("Failed to sync schedule from cloud:", err);
    return null;
  }
}

// Uploads the current schedule to Supabase
async function uploadScheduleToCloud(week: WeekSchedule, userId: string) {
  if (!userId) return;
  try {
    const contentStr = JSON.stringify(week);
    
    // Use upsert pattern: try to find existing, then update or insert
    const { data: existing, error: selectErr } = await supabase
      .from("schedules")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    
    if (selectErr) {
      console.error("Schedule upload SELECT error:", selectErr.message, selectErr.code);
    }
    
    if (existing?.id) {
      const { error: updateErr } = await supabase
        .from("schedules")
        .update({ content: contentStr })
        .eq("id", existing.id);
      if (updateErr) {
        console.error("Schedule upload UPDATE error:", updateErr.message, updateErr.code);
      } else {
        console.log("Schedule updated in cloud");
      }
    } else {
      const { error: insertErr } = await supabase
        .from("schedules")
        .insert({ user_id: userId, content: contentStr });
      if (insertErr) {
        console.error("Schedule upload INSERT error:", insertErr.message, insertErr.code);
      } else {
        console.log("Schedule inserted into cloud");
      }
    }
  } catch (err) {
    console.error("Failed to upload schedule:", err);
  }
}

// ─── Get Today's Schedule (Sync Local Cache) ────────────────

export function getTodaySchedule(userId?: string): DaySchedule | null {
  const today = formatDate(new Date());
  const key = userId ? `eduvest_week_schedule_${userId}` : "eduvest_week_schedule";
  const savedWeek = localStorage.getItem(key);
  if (!savedWeek) return null;
  try {
    const week: WeekSchedule = JSON.parse(savedWeek);
    return week.days.find(d => d.date === today) || null;
  } catch { return null; }
}

export function getWeekSchedule(userId?: string): WeekSchedule | null {
  const key = userId ? `eduvest_week_schedule_${userId}` : "eduvest_week_schedule";
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try { return JSON.parse(saved); } catch { return null; }
}

export function saveWeekSchedule(week: WeekSchedule, userId?: string) {
  const key = userId ? `eduvest_week_schedule_${userId}` : "eduvest_week_schedule";
  localStorage.setItem(key, JSON.stringify(week));
  window.dispatchEvent(new CustomEvent("schedule-updated", { detail: week }));
  
  // Background sync to cloud
  if (userId) {
    uploadScheduleToCloud(week, userId);
  }
}

export function getRoutineInput(userId?: string): RoutineInput | null {
  const key = userId ? `eduvest_routine_input_${userId}` : "eduvest_routine_input";
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try { return JSON.parse(saved); } catch { return null; }
}

export function saveRoutineInput(input: RoutineInput, userId?: string) {
  const key = userId ? `eduvest_routine_input_${userId}` : "eduvest_routine_input";
  localStorage.setItem(key, JSON.stringify(input));
}

// ─── Completion Tracking ────────────────────────────────────

export function toggleBlockCompletion(date: string, blockIndex: number, userId?: string): DaySchedule | null {
  const key = userId ? `eduvest_week_schedule_${userId}` : "eduvest_week_schedule";
  const savedWeek = localStorage.getItem(key);
  if (!savedWeek) return null;
  try {
    const week: WeekSchedule = JSON.parse(savedWeek);
    const day = week.days.find(d => d.date === date);
    if (!day || !day.blocks[blockIndex]) return null;
    
    day.blocks[blockIndex].completed = !day.blocks[blockIndex].completed;
    
    // If un-completing, clear verification metadata
    if (!day.blocks[blockIndex].completed) {
      delete day.blocks[blockIndex].actualCost;
      delete day.blocks[blockIndex].verificationNote;
      delete day.blocks[blockIndex].completedAt;
    } else {
      day.blocks[blockIndex].completedAt = new Date().toISOString();
    }
    
    saveWeekSchedule(week, userId);
    return day;
  } catch { return null; }
}

export function verifyBlockCompletion(
  date: string, 
  blockIndex: number, 
  data: { actualCost?: number, verificationNote?: string },
  userId?: string
): DaySchedule | null {
  const key = userId ? `eduvest_week_schedule_${userId}` : "eduvest_week_schedule";
  const savedWeek = localStorage.getItem(key);
  if (!savedWeek) return null;
  try {
    const week: WeekSchedule = JSON.parse(savedWeek);
    const day = week.days.find(d => d.date === date);
    if (!day || !day.blocks[blockIndex]) return null;
    
    day.blocks[blockIndex].completed = true;
    day.blocks[blockIndex].completedAt = new Date().toISOString();
    
    if (data.actualCost !== undefined) {
      day.blocks[blockIndex].actualCost = data.actualCost;
    }
    if (data.verificationNote !== undefined) {
      day.blocks[blockIndex].verificationNote = data.verificationNote;
    }
    
    saveWeekSchedule(week, userId);
    return day;
  } catch { return null; }
}

export function getCompletionPercent(day: DaySchedule): number {
  if (day.blocks.length === 0) return 0;
  const done = day.blocks.filter(b => b.completed).length;
  return Math.round((done / day.blocks.length) * 100);
}

// ─── Helpers ────────────────────────────────────────────────

function getStudyLabel(dayType: DayType): string {
  switch (dayType) {
    case "Focus Day": return "Focused Study Block";
    case "Class Day": return "Post-Class Review";
    case "Balanced Day": return "Study Session";
    case "Revision Day": return "Revision & Practice";
    default: return "Study Time";
  }
}

function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function shiftTime(time: string, minutesOffset: number): string {
  return minutesToTime(parseTimeToMinutes(time) + minutesOffset);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
