import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronRight, CheckCircle2, Settings2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { getTodaySchedule, getCompletionPercent, toggleBlockCompletion, syncScheduleFromCloud } from "@/utils/schedule-rules";
import { CATEGORY_COLORS } from "@/utils/schedule-types";
import type { DaySchedule } from "@/utils/schedule-types";
import { format } from "date-fns";
import { useAuth } from "@/utils/auth";
import { Loader2 } from "lucide-react";

const DAY_TYPE_STYLES: Record<string, string> = {
  "Focus Day":    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  "Class Day":    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "Balanced Day": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "Recovery Day": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "Revision Day": "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  "Flexible Day": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "Rest Day":     "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700",
};

export function ScheduleDashboardCard() {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const loadSchedule = () => {
    setSchedule(getTodaySchedule(userId));
  };

  useEffect(() => {
    // 1. Initial quick load from local cache
    loadSchedule();
    
    // 2. Background sync from cloud mapping to local cache
    if (userId) {
      setIsSyncing(true);
      syncScheduleFromCloud(userId).then(() => {
        setIsSyncing(false);
        loadSchedule();
      });
    }

    const handler = () => loadSchedule();
    window.addEventListener("schedule-updated", handler);
    return () => window.removeEventListener("schedule-updated", handler);
  }, [userId]);

  const handleToggle = (idx: number) => {
    if (!schedule) return;
    const updated = toggleBlockCompletion(schedule.date, idx, userId);
    if (updated) setSchedule({ ...updated });
  };

  const completionPct = schedule ? getCompletionPercent(schedule) : 0;

  // No schedule state
  if (!schedule) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground">Today's Schedule</h3>
          <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, MMM do")}</span>
        </div>
        <div className="py-8 text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <CalendarDays className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No routine set up yet</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[240px]">
            Enter your daily routine details to generate a personalized weekly schedule.
          </p>
          <Button
            size="sm"
            onClick={() => navigate("/schedule")}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Settings2 className="h-3.5 w-3.5 mr-1.5" /> Set Up Routine
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">Today's Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMM do")}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border",
            DAY_TYPE_STYLES[schedule.dayType] || DAY_TYPE_STYLES["Balanced Day"]
          )}>
            {schedule.dayType}
          </span>
          {completionPct === 100 && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
              Day Complete ✓
            </span>
          )}
        </div>
      </div>

      {/* Completion bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">Progress</span>
          <span className="font-bold text-foreground">{completionPct}%</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Task list — show top 6 */}
      <div className="space-y-2">
        {schedule.blocks.slice(0, 6).map((block, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl border transition-all cursor-pointer group",
              block.completed
                ? "bg-muted/50 border-border opacity-60"
                : "bg-card border-border hover:border-slate-300 dark:hover:border-slate-600"
            )}
            onClick={() => handleToggle(idx)}
          >
            <div className={cn(
              "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
              block.completed
                ? "border-emerald-500 bg-emerald-500"
                : "border-slate-300 group-hover:border-slate-400 dark:border-slate-600"
            )}>
              {block.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
            </div>
            <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">{block.time}</span>
            <span className="text-[13px] font-medium text-foreground truncate flex items-center gap-1.5">
              <span>{block.icon}</span>
              <span className={block.completed ? "line-through" : ""}>{block.activity}</span>
            </span>
            {block.cost > 0 && (
              <span className="ml-auto text-xs font-semibold text-rose-500 shrink-0">₹{block.cost}</span>
            )}
          </div>
        ))}
        {schedule.blocks.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{schedule.blocks.length - 6} more tasks
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Daily Budget: <strong className="text-foreground">₹{schedule.totalCost}</strong></span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/schedule")}
          className="text-xs h-8 text-muted-foreground hover:text-foreground"
        >
          View Full Schedule <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}
