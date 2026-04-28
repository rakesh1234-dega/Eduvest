import { useState, useEffect } from "react";
import { ScheduleBlock, CATEGORY_COLORS } from "@/utils/schedule-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/utils";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: { actualCost?: number; verificationNote?: string }) => void;
  block: ScheduleBlock | null;
}

export function VerificationModal({ isOpen, onClose, onVerify, block }: VerificationModalProps) {
  const [actualCost, setActualCost] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (isOpen && block) {
      setActualCost(block.cost > 0 ? block.cost.toString() : "");
      setNote("");
    }
  }, [isOpen, block]);

  if (!block) return null;

  // Categories that often incur expenses even if estimated cost is 0.
  const isExpenseCategory = ["meal", "travel", "gym", "personal"].includes(block.category);
  const showExpenseInput = block.cost > 0 || isExpenseCategory;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify({
      actualCost: showExpenseInput && actualCost !== "" ? Number(actualCost) : undefined,
      verificationNote: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Verify Task Completion
          </DialogTitle>
          <DialogDescription>
            Confirm you completed this task to update your schedule and track expenses.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{block.icon}</span>
              <div>
                <h4 className="font-bold text-lg">{block.activity}</h4>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {block.time} - {block.endTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                "text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md border",
                CATEGORY_COLORS[block.category] || "bg-slate-50 text-slate-600 border-slate-200"
              )}>
                {block.category}
              </span>
              {block.cost > 0 && (
                <span className="text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border shadow-sm">
                  Est. Cost: ₹{block.cost}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {showExpenseInput && (
              <div className="space-y-2">
                <Label htmlFor="actualCost" className="font-semibold flex items-center justify-between">
                  How much did you actually spend?
                  {block.cost > 0 && <span className="text-xs text-muted-foreground font-normal">Estimated: ₹{block.cost}</span>}
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-muted-foreground font-medium">₹</span>
                  </div>
                  <Input
                    id="actualCost"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8 text-lg font-medium"
                    placeholder="0.00"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verificationNote" className="font-semibold">
                What did you do? <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="verificationNote"
                placeholder="Briefly describe your session..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2 pt-2 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Yes, I completed this
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
