import { useState } from "react";
import { CalendarClock, Mail, Trophy, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PhonePeParser } from "./PhonePeParser";
import { DailyDetailsForm } from "./DailyDetailsForm";

interface AIAssistantCardProps {
  onAutoFillTx: (data: { amount: string; vendor: string; isExpense: boolean }) => void;
}

export function AIAssistantCard({ onAutoFillTx }: AIAssistantCardProps) {
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [scheduleSent, setScheduleSent] = useState(false);

  const handleScheduleGenerated = (schedule: any[]) => {
    setScheduleSent(true);
    // Refresh TodayScheduleCard will happen via localStorage event or state if we had a global store
    // For now, we'll just trigger a custom event that TodayScheduleCard can listen for
    window.dispatchEvent(new CustomEvent('smart-schedule-updated', { detail: schedule }));
    setTimeout(() => setScheduleSent(false), 5000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Settings2 className="h-24 w-24 text-slate-400" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-1.5 rounded-lg shadow-sm">
            <Settings2 className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-foreground">Smart Assistant</h3>
        </div>

        <div className="space-y-4">
          {/* Schedule Generator */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-50">
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
              <CalendarClock className="h-4 w-4 text-indigo-500" /> Daily Plan
            </h4>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Analyze your budget and create a personalized financial daily schedule.
            </p>
            <Button 
              size="sm" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              onClick={() => setShowDetailsForm(true)}
              disabled={scheduleSent}
            >
              {scheduleSent ? (
                <><Trophy className="h-3 w-3 mr-2 text-amber-300" /> Saved! +10 pts</>
              ) : (
                <><Mail className="h-3 w-3 mr-2" /> Generate Today's Schedule</>
              )}
            </Button>
          </div>

          {/* Receipt Parser */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Receipt Scanner
            </h4>
            <PhonePeParser onParsed={onAutoFillTx} />
          </div>
        </div>
      </div>

      <DailyDetailsForm 
        isOpen={showDetailsForm} 
        onClose={() => setShowDetailsForm(false)} 
        onScheduleGenerated={handleScheduleGenerated} 
      />
    </div>
  );
}
