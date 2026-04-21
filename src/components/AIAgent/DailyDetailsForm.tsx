import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Loader2 } from "lucide-react";
import { DailyDetails, generateManualScheduleEngine } from "@/utils/schedule-engine";
import { toast } from "sonner";
import { useAuth } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";
import { useAddPoints } from "@/hooks/use-profile";

interface DailyDetailsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (schedule: any[]) => void;
}

export function DailyDetailsForm({ isOpen, onClose, onScheduleGenerated }: DailyDetailsFormProps) {
  const { user } = useAuth();
  const addPoints = useAddPoints();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<DailyDetails>({
    monthlyBudget: 5000,
    transportMode: "Auto",
    transportCost: 20,
    breakfastPref: "Oats & Fruits",
    lunchPref: "Rice & Dal",
    dinnerPref: "Roti & Sabzi",
    gymTime: "6:00 PM",
    proteinPref: "Egg/Whey",
    goals: "Save money and stay fit",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Uses our local manual engine 
      const schedule = await generateManualScheduleEngine(details);
      
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`manual_schedule_${today}`, JSON.stringify(schedule));

      if (user) {
        try {
          await supabase.from("schedules").insert({
            user_id: user.id,
            content: JSON.stringify(schedule),
          });
          await addPoints.mutateAsync({ points: 10, activityName: "smart_schedule" });
        } catch (dbErr) {
          console.warn("DB save failed, but schedule generated:", dbErr);
        }
      }

      onScheduleGenerated(schedule);
      toast.success("Daily Schedule Generated! +10 Points");
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to generate schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-indigo-500" />
            Smart Schedule Planner
          </DialogTitle>
          <DialogDescription>
            Tell us about your daily routine to get a personalized mathematical plan based on your limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Budget (₹)</Label>
              <Input 
                id="budget" 
                type="number" 
                value={details.monthlyBudget} 
                onChange={(e) => setDetails({...details, monthlyBudget: Number(e.target.value)})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport-mode">Transport Mode</Label>
              <Select onValueChange={(v) => setDetails({...details, transportMode: v})} defaultValue={details.transportMode}>
                <SelectTrigger id="transport-mode">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Metro">Metro</SelectItem>
                  <SelectItem value="Bike">Bike</SelectItem>
                  <SelectItem value="Walk">Walk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transport-cost">Morning Transport (₹)</Label>
              <Input 
                id="transport-cost" 
                type="number" 
                value={details.transportCost} 
                onChange={(e) => setDetails({...details, transportCost: Number(e.target.value)})}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gym-time">Gym / Activity Time</Label>
              <Input 
                id="gym-time" 
                placeholder="e.g. 6:00 PM" 
                value={details.gymTime} 
                onChange={(e) => setDetails({...details, gymTime: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Food Preferences</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input 
                placeholder="Breakfast" 
                value={details.breakfastPref} 
                onChange={(e) => setDetails({...details, breakfastPref: e.target.value})} 
              />
              <Input 
                placeholder="Lunch" 
                value={details.lunchPref} 
                onChange={(e) => setDetails({...details, lunchPref: e.target.value})} 
              />
              <Input 
                placeholder="Dinner" 
                value={details.dinnerPref} 
                onChange={(e) => setDetails({...details, dinnerPref: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="protein">Protein / Snack Preference</Label>
            <Input 
              id="protein" 
              placeholder="e.g. Eggs, Whey, Paneer" 
              value={details.proteinPref} 
              onChange={(e) => setDetails({...details, proteinPref: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Main Financial/Health Goal</Label>
            <Textarea 
              id="goals" 
              placeholder="e.g. Save 20% of my pocket money..." 
              value={details.goals} 
              onChange={(e) => setDetails({...details, goals: e.target.value})} 
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : "Generate Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

