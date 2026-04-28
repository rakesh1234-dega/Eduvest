import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarDays, ChevronDown, CheckCircle2, Save, Undo, Plus, Settings2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { useAuth } from "@/utils/auth";

import {
  RoutineInput, WeekSchedule, DaySchedule, ScheduleBlock, DEFAULT_ROUTINE, CATEGORY_COLORS 
} from "@/utils/schedule-types";
import {
  generateWeekSchedule, getWeekSchedule, saveWeekSchedule,
  getRoutineInput, saveRoutineInput, toggleBlockCompletion, verifyBlockCompletion,
  syncScheduleFromCloud
} from "@/utils/schedule-rules";
import { useAddPoints } from "@/hooks/use-profile";
import { VerificationModal } from "@/components/Schedule/VerificationModal";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateTransaction } from "@/hooks/use-transactions";

const DAY_TYPE_STYLES: Record<string, string> = {
  "Focus Day":    "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Class Day":    "bg-blue-50 text-blue-700 border-blue-200",
  "Balanced Day": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Recovery Day": "bg-amber-50 text-amber-700 border-amber-200",
  "Revision Day": "bg-teal-50 text-teal-700 border-teal-200",
  "Flexible Day": "bg-purple-50 text-purple-700 border-purple-200",
  "Rest Day":     "bg-slate-50 text-slate-600 border-slate-200",
};

export default function SchedulePage() {
  const { user } = useAuth();
  const userId = user?.id;

  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [routine, setRoutine] = useState<RoutineInput>(DEFAULT_ROUTINE);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [verificationBlock, setVerificationBlock] = useState<{ date: string, index: number, block: ScheduleBlock } | null>(null);
  
  const addPoints = useAddPoints();
  const { data: accounts } = useAccounts();
  const createTransaction = useCreateTransaction();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    // 1. Instantly load from local storage cache
    const savedWeek = getWeekSchedule(userId);
    const savedRoutine = getRoutineInput(userId);
    
    if (savedWeek) {
      setWeekSchedule(savedWeek);
      setExpandedDay(todayStr);
    } else {
      setIsEditing(true);
    }
    
    if (savedRoutine) setRoutine(savedRoutine);

    // 2. Sync from Supabase in the background
    if (userId) {
      setIsSyncing(true);
      syncScheduleFromCloud(userId).then(cloudWeek => {
        setIsSyncing(false);
        if (cloudWeek && JSON.stringify(cloudWeek) !== JSON.stringify(savedWeek)) {
          setWeekSchedule(cloudWeek);
        }
      });
    }
  }, [userId]);

  const handleGenerate = () => {
    try {
      saveRoutineInput(routine, userId);
      const newWeek = generateWeekSchedule(routine);
      saveWeekSchedule(newWeek, userId);
      setWeekSchedule(newWeek);
      setExpandedDay(todayStr);
      setIsEditing(false);
      toast.success("Schedule successfully created!", { 
        description: "Your personalized weekly plan is ready." 
      });
      addPoints.mutate({ points: 20, activityName: "Generated Schedule" });
    } catch (e) {
      toast.error("Failed to generate schedule");
    }
  };

  const updateScheduleState = (date: string, updatedDay: DaySchedule | null) => {
    if (!updatedDay || !weekSchedule) return;
    const allCompleted = updatedDay.blocks.every(b => b.completed);
    const previouslyAllCompleted = weekSchedule.days.find(d => d.date === date)?.blocks.every(b => b.completed);
    
    const newWeek = {
      ...weekSchedule,
      days: weekSchedule.days.map(d => d.date === date ? updatedDay : d)
    };
    setWeekSchedule(newWeek);
    
    if (allCompleted && !previouslyAllCompleted) {
      toast.success("Perfect Day! 🎉", { description: "+15 Points awarded for finishing all tasks." });
      addPoints.mutate({ points: 15, activityName: "Completed Daily Schedule" });
    }
  };

  const handleToggleBlock = (date: string, blockIdx: number) => {
    if (!weekSchedule) return;
    const day = weekSchedule.days.find(d => d.date === date);
    if (!day) return;
    const block = day.blocks[blockIdx];

    if (!block.completed) {
      setVerificationBlock({ date, index: blockIdx, block });
    } else {
      const updatedDay = toggleBlockCompletion(date, blockIdx, userId);
      updateScheduleState(date, updatedDay);
    }
  };

  const handleVerify = async (data: { actualCost?: number, verificationNote?: string }) => {
    if (!verificationBlock || !weekSchedule) return;
    const { date, index, block } = verificationBlock;

    const updatedDay = verifyBlockCompletion(date, index, data, userId);
    updateScheduleState(date, updatedDay);

    if (data.actualCost && data.actualCost > 0 && accounts && accounts.length > 0) {
      const defaultAccount = accounts.find(a => a.is_default) || accounts[0];
      try {
        await createTransaction.mutateAsync({
          type: "expense",
          amount: data.actualCost,
          account_id: defaultAccount.id,
          description: block.activity,
          date: todayStr,
        });
      } catch (e) {
        console.error("Failed to create expense transaction", e);
      }
    }
  };

  const handleDayClick = (day: DaySchedule) => {
    const isPast = day.date < todayStr;
    if (isPast) return; // Past days are disabled

    if (day.date === todayStr && expandedDay !== todayStr) {
      toast.info(`📅 Today's Plan: ${day.dayType}`, {
        description: `${day.blocks.length} tasks scheduled • Daily budget: ₹${day.totalCost}`,
        duration: 4000,
      });
    }

    setExpandedDay(expandedDay === day.date ? null : day.date);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule & Routine</h1>
          <p className="text-muted-foreground text-sm mt-1">Rule-based manual planning for a structured week.</p>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          onClick={() => setIsEditing(!isEditing)}
          className={cn(!isEditing && "gradient-primary")}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel Edit" : "Edit Routine"}
        </Button>
      </div>

      {isEditing && (
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" /> Setup Your Routine
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Daily Timings</h3>
              <div className="space-y-1.5">
                <Label>Wake Up Time</Label>
                <Input value={routine.wakeUpTime} onChange={e => setRoutine({...routine, wakeUpTime: e.target.value})} placeholder="e.g. 6:30 AM" />
              </div>
              <div className="space-y-1.5">
                <Label>Sleep Time</Label>
                <Input value={routine.sleepTime} onChange={e => setRoutine({...routine, sleepTime: e.target.value})} placeholder="e.g. 11:00 PM" />
              </div>
              <div className="space-y-1.5">
                <Label>Class / Work (Start)</Label>
                <Input value={routine.classTime} onChange={e => setRoutine({...routine, classTime: e.target.value})} placeholder="e.g. 9:00 AM" />
              </div>
              <div className="space-y-1.5">
                <Label>Class / Work (End)</Label>
                <Input value={routine.classEndTime} onChange={e => setRoutine({...routine, classEndTime: e.target.value})} placeholder="e.g. 2:00 PM" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Activities & Budget</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Study Hours</Label>
                  <Input type="number" min="0" value={routine.studyHours} onChange={e => setRoutine({...routine, studyHours: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <Label>Gym (mins)</Label>
                  <Input type="number" min="0" value={routine.gymDuration} onChange={e => setRoutine({...routine, gymDuration: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Gym Time</Label>
                <Input value={routine.gymTime} onChange={e => setRoutine({...routine, gymTime: e.target.value})} placeholder="e.g. 5:30 PM" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Monthly Budget</Label>
                  <Input type="number" value={routine.monthlyBudget} onChange={e => setRoutine({...routine, monthlyBudget: Number(e.target.value)})} />
                </div>
                <div className="space-y-1.5">
                  <Label>Food Plan (₹/mo)</Label>
                  <Input type="number" value={routine.mealBudget} onChange={e => setRoutine({...routine, mealBudget: Number(e.target.value)})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Transport</Label>
                  <Input value={routine.transportMode} onChange={e => setRoutine({...routine, transportMode: e.target.value})} placeholder="Bus/Metro" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cost / Trip</Label>
                  <Input type="number" value={routine.transportCost} onChange={e => setRoutine({...routine, transportCost: Number(e.target.value)})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm border-b pb-2">Preferences</h3>
              <div className="space-y-1.5">
                <Label>Focus Preference</Label>
                <Select value={routine.focusPreference} onValueChange={(val: any) => setRoutine({...routine, focusPreference: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Person</SelectItem>
                    <SelectItem value="afternoon">Afternoon Person</SelectItem>
                    <SelectItem value="evening">Night Owl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Weekend Plan</Label>
                <Select value={routine.weekendPreference} onValueChange={(val: any) => setRoutine({...routine, weekendPreference: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">Full Rest</SelectItem>
                    <SelectItem value="light-study">Light Study & Chill</SelectItem>
                    <SelectItem value="productive">Highly Productive</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Personal / Hobbies</Label>
                <Input value={routine.personalTasks} onChange={e => setRoutine({...routine, personalTasks: e.target.value})} placeholder="Reading, Coding, Guitar..." />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleGenerate}>
              <Save className="h-4 w-4 mr-2" /> Generate Weekly Schedule
            </Button>
          </div>
        </div>
      )}

      {!isEditing && !weekSchedule && (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
          <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schedule Created</h3>
          <p className="text-muted-foreground mb-6">Set up your routine to generate a manual schedule.</p>
          <Button onClick={() => setIsEditing(true)} className="gradient-primary"><Plus className="h-4 w-4 mr-2" /> Set Up Routine</Button>
        </div>
      )}

      {weekSchedule && !isEditing && (
        <div className="space-y-8">
          {/* Week Overview */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekSchedule.days.map((day) => {
              const isToday = day.date === todayStr;
              const isPast = day.date < todayStr;
              const isFuture = day.date > todayStr;
              const isExpanded = expandedDay === day.date;
              const completedCount = day.blocks.filter(b => b.completed).length;
              const totalBlocks = day.blocks.length;
              const allDone = completedCount === totalBlocks && totalBlocks > 0;

              return (
                <div 
                  key={day.date}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "bg-card rounded-xl border p-4 transition-all",
                    isPast && "opacity-40 cursor-not-allowed",
                    !isPast && "cursor-pointer hover:shadow-md",
                    isToday && "ring-2 ring-primary border-transparent",
                    isFuture && "hover:border-slate-300",
                    isExpanded && !isPast ? "shadow-md" : ""
                  )}
                >
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{day.dayName.slice(0,3)}</p>
                  <p className={cn("text-xl font-bold mt-1", isToday ? "text-primary" : isPast ? "text-muted-foreground" : "text-foreground")}>
                    {format(new Date(day.date + "T12:00:00"), "dd")}
                  </p>
                  <div className="mt-3">
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block truncate max-w-full",
                      isPast ? "bg-slate-50 text-slate-400 border-slate-200" : DAY_TYPE_STYLES[day.dayType]
                    )}>
                      {isPast ? "Past" : allDone ? "Done ✓" : day.dayType}
                    </span>
                  </div>
                  {totalBlocks > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all", allDone ? "bg-emerald-500" : "bg-primary")}
                          style={{ width: `${(completedCount/totalBlocks)*100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expanded Day Detail */}
          {expandedDay && expandedDay >= todayStr && (
            <div className="bg-card rounded-3xl border border-border p-6 md:p-8 shadow-sm relative overflow-hidden">
              {(() => {
                const activeDay = weekSchedule.days.find(d => d.date === expandedDay);
                if (!activeDay) return null;

                const isToday = activeDay.date === todayStr;
                const allDone = activeDay.blocks.every(b => b.completed);

                return (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-border pb-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {isToday ? "Today's Plan" : `${activeDay.dayName}'s Plan`}
                        </h2>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {format(new Date(activeDay.date + "T12:00:00"), "MMMM do, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("px-3 py-1 rounded-full text-sm font-bold border", DAY_TYPE_STYLES[activeDay.dayType])}>
                          {activeDay.dayType}
                        </span>
                        {allDone && (
                          <span className="px-3 py-1 rounded-full text-sm font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Completed ✓
                          </span>
                        )}
                        <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-semibold">
                          Daily Budget: <span className="text-primary font-bold">₹{activeDay.totalCost}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pl-2 sm:pl-4">
                      <div className="absolute left-[36px] sm:left-[44px] top-32 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800 -z-10" />
                      
                      {activeDay.blocks.map((block, idx) => (
                        <div key={idx} className="flex items-start gap-4 sm:gap-6 group">
                          <button 
                            onClick={() => handleToggleBlock(activeDay.date, idx)}
                            disabled={!isToday}
                            className={cn(
                              "mt-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all shadow-sm z-10",
                              block.completed ? "bg-emerald-500 border-emerald-500 text-white" : "bg-card border-slate-300 hover:border-emerald-400 text-transparent",
                              !isToday && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                          
                          <div className={cn(
                            "flex-1 bg-card rounded-2xl border p-4 sm:p-5 transition-all",
                            block.completed ? "border-transparent opacity-60 bg-muted/50 shadow-none" : "border-border shadow-sm hover:shadow-md hover:border-slate-300"
                          )}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{block.icon}</span>
                                <div>
                                  <h4 className={cn("font-bold text-base sm:text-lg", block.completed && "line-through text-muted-foreground")}>
                                    {block.activity}
                                  </h4>
                                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5" />
                                    {block.time} - {block.endTime}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                <span className={cn(
                                  "text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                                  CATEGORY_COLORS[block.category] || "bg-slate-50 text-slate-600 border-slate-200"
                                )}>
                                  {block.category}
                                </span>
                                {(block.cost > 0 || block.actualCost !== undefined) && (
                                  <span className={cn(
                                    "text-xs font-bold px-2 py-1 rounded-md border",
                                    block.completed && block.actualCost !== undefined && block.actualCost > block.cost
                                      ? "text-rose-600 bg-rose-50 border-rose-200"
                                      : "text-slate-500 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                                  )}>
                                    {block.completed && block.actualCost !== undefined 
                                      ? `Spent: ₹${block.actualCost} / ₹${block.cost}`
                                      : `Est: ₹${block.cost}`}
                                  </span>
                                )}
                                {block.completed && block.verificationNote && (
                                  <span className="text-[10px] text-muted-foreground truncate max-w-xs mt-1" title={block.verificationNote}>
                                    "{block.verificationNote}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <VerificationModal
        isOpen={!!verificationBlock}
        onClose={() => setVerificationBlock(null)}
        onVerify={handleVerify}
        block={verificationBlock?.block || null}
      />
    </div>
  );
}
