import { Clock, CheckCircle2, MapPin, Dumbbell, Utensils, CalendarClock, Settings2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { ScheduleItem } from "@/utils/schedule-engine";
import { DailyDetailsForm } from "./DailyDetailsForm";
import { Button } from "@/components/ui/button";

export function TodayScheduleCard() {
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const loadSchedule = () => {
    const today = new Date().toISOString().split("T")[0];
    const saved = localStorage.getItem(`manual_schedule_${today}`);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse schedule", e);
      }
    }
  };

  useEffect(() => {
    loadSchedule();
    const timer = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    
    const handleUpdate = (e: any) => {
      setItems(e.detail);
    };
    window.addEventListener('smart-schedule-updated', handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('smart-schedule-updated', handleUpdate);
    };
  }, []);

  const handleScheduleGenerated = (schedule: any[]) => {
    setItems(schedule);
    window.dispatchEvent(new CustomEvent('smart-schedule-updated', { detail: schedule }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "transport": return <MapPin className="h-4 w-4" />;
      case "food": return <Utensils className="h-4 w-4" />;
      case "gym": return <Dumbbell className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalCost = items.reduce((sum, i) => sum + i.cost, 0);

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
               Smart Daily Planner
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{format(new Date(), "EEEE, MMM do")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              size="sm" 
              variant={items.length > 0 ? "outline" : "default"}
              className={cn(
                items.length > 0 
                  ? "border-slate-200 text-slate-600 hover:bg-slate-50" 
                  : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900"
              )}
              onClick={() => setShowForm(true)}
            >
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              {items.length > 0 ? "Regenerate" : "Generate Schedule"}
            </Button>
            <div className="bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <Clock className="h-3.5 w-3.5" /> 
              {format(new Date(), "h:mm a")}
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, idx) => {
              // Simple logic to check if current block is "active"
              const itemHour = parseInt(item.time);
              const isActive = currentHour >= itemHour && (idx === items.length - 1 || currentHour < parseInt(items[idx+1].time));
              const isPast = currentHour > itemHour && !isActive;

              return (
                <div key={idx} className={cn(
                  "relative flex gap-4 p-4 rounded-xl border transition-all duration-300",
                  isActive ? "bg-slate-50 border-slate-200 shadow-sm scale-[1.02] dark:bg-slate-800/50 dark:border-slate-700" : "bg-card border-border",
                  isPast && "opacity-60"
                )}>
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2 border-white dark:border-slate-900",
                    isActive ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-muted text-slate-400"
                  )}>
                    {getIcon(item.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", isActive ? "text-slate-900 dark:text-white" : "text-muted-foreground")}>
                        {item.time}
                      </span>
                      {item.cost > 0 && <span className="text-xs font-bold text-rose-500">₹{item.cost}</span>}
                      {isPast && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <h4 className="text-sm font-bold text-foreground truncate">{item.activity}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.details}</p>
                  </div>
                </div>
              );
            })}
            
            <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-dashed border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Daily Estimated Spend:</span>
              <span className="text-sm font-bold text-foreground">₹{totalCost}</span>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <CalendarClock className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No schedule for today yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4 max-w-xs">
              Click "Generate Schedule" above to manually construct your personalized daily plan.
            </p>
          </div>
        )}
      </div>

      <DailyDetailsForm 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        onScheduleGenerated={handleScheduleGenerated} 
      />
    </>
  );
}

