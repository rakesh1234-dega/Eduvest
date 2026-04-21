/**
 * Schedule Notification System
 * Sends browser notifications when a scheduled task time arrives.
 * Runs a 1-minute interval check. No external APIs.
 * User-scoped: each user gets their own notifications.
 */

import { getTodaySchedule } from "./schedule-rules";
import type { ScheduleBlock } from "./schedule-types";

let notificationInterval: ReturnType<typeof setInterval> | null = null;
const notifiedTasks = new Set<string>();
let activeUserId: string | undefined;

function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function sendNotification(block: ScheduleBlock) {
  const key = `${block.time}-${block.activity}`;
  if (notifiedTasks.has(key)) return;
  notifiedTasks.add(key);

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`${block.icon} ${block.activity}`, {
      body: `${block.time} — Time for: ${block.activity}`,
      icon: "/favicon.ico",
      tag: key,
    });
  }

  // Also dispatch a custom event for in-app toast
  window.dispatchEvent(new CustomEvent("schedule-notification", {
    detail: { block }
  }));
}

function checkSchedule() {
  const todaySchedule = getTodaySchedule(activeUserId);
  if (!todaySchedule) return;

  const nowMins = getCurrentMinutes();

  for (const block of todaySchedule.blocks) {
    if (block.completed) continue;
    const blockMins = parseTimeToMinutes(block.time);
    if (blockMins < 0) continue;

    // Notify if we're within 1 minute of the block time
    const diff = nowMins - blockMins;
    if (diff >= 0 && diff <= 1) {
      sendNotification(block);
    }
  }
}

export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function startScheduleNotifications(userId?: string) {
  activeUserId = userId;
  requestNotificationPermission();

  // Clear old notified tasks at start of each day
  const today = new Date().toDateString();
  const storedDay = localStorage.getItem("eduvest_notif_day");
  if (storedDay !== today) {
    notifiedTasks.clear();
    localStorage.setItem("eduvest_notif_day", today);
  }

  // Start interval (check every 60 seconds)
  if (notificationInterval) clearInterval(notificationInterval);
  notificationInterval = setInterval(checkSchedule, 60_000);

  // Also check immediately
  checkSchedule();
}

export function stopScheduleNotifications() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
}
