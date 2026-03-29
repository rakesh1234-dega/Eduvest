import { useState, useMemo } from "react";
import { useCurrentBudget, useUpsertBudget } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, Target, PiggyBank, Edit3, CheckCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function BudgetPage() {
  const { data: budget, isLoading } = useCurrentBudget();
  const { data: transactions } = useTransactions();
  const upsertBudget = useUpsertBudget();
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [editing, setEditing] = useState(false);

  const monthExpense = useMemo(() => {
    if (!transactions) return 0;
    const now   = new Date();
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end   = format(endOfMonth(now),   "yyyy-MM-dd");
    return transactions
      .filter((t: any) => t.type === "expense" && t.date >= start && t.date <= end)
      .reduce((s: number, t: any) => s + t.amount, 0);
  }, [transactions]);

  const budgetPercent = budget ? Math.min(100, (monthExpense / budget.amount) * 100) : 0;
  const remaining     = budget ? budget.amount - monthExpense : 0;
  const isOver        = remaining < 0;
  const isWarning     = budget && budgetPercent >= budget.alert_threshold;

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid budget amount"); return; }
    await upsertBudget.mutateAsync({
      amount: amt,
      month: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      alert_threshold: parseInt(threshold) || 80,
      savings_goal: parseFloat(savingsGoal) || 0,
    });
    setAmount(""); setEditing(false);
    toast.success("Budget saved!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      </div>
    );
  }

  const barColor = budgetPercent >= 100 ? "bg-rose-500" : isWarning ? "bg-amber-500" : "gradient-primary";

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Main budget card */}
      {budget ? (
        <div className="bg-white rounded-2xl border border-border p-6 card-hover">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Budget</p>
              <p className="text-4xl font-bold mt-1 text-foreground">₹{budget.amount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{format(new Date(), "MMMM yyyy")}</p>
            </div>
            <div className="flex items-center gap-2">
              {isWarning && (
                <span className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl",
                  isOver ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                )}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {isOver ? "Over Budget!" : "Near Limit"}
                </span>
              )}
              <button
                onClick={() => { setEditing(true); setAmount(String(budget.amount)); setThreshold(String(budget.alert_threshold)); setSavingsGoal(String(budget.savings_goal || "")); }}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">₹{monthExpense.toLocaleString()} spent</span>
              <span className={cn("font-semibold", isOver ? "text-rose-500" : "text-emerald-600")}>
                {isOver ? `-₹${Math.abs(remaining).toLocaleString()} over` : `₹${remaining.toLocaleString()} left`}
              </span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", barColor)}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">{budgetPercent.toFixed(1)}% used</span>
              <span>100%</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: TrendingDown, label: "Spent",        value: `₹${monthExpense.toLocaleString()}`,           bg: "bg-rose-50",    color: "text-rose-500"   },
              { icon: Target,       label: "Alert at",     value: `${budget.alert_threshold}%`,                   bg: "bg-amber-50",   color: "text-amber-600"  },
              { icon: PiggyBank,    label: "Savings Goal", value: `₹${(budget.savings_goal || 0).toLocaleString()}`, bg: "bg-violet-50",  color: "text-violet-600" },
            ].map(({ icon: Icon, label, value, bg, color }) => (
              <div key={label} className={cn("rounded-xl p-4 text-center", bg)}>
                <Icon className={cn("h-5 w-5 mx-auto mb-1.5", color)} />
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wide">{label}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Savings progress card */}
      {budget && budget.savings_goal > 0 && (
        <div className="bg-white rounded-2xl border border-border p-5 card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Savings Progress</h3>
              <p className="text-xs text-muted-foreground">Target: ₹{budget.savings_goal.toLocaleString()}</p>
            </div>
          </div>
          {(() => {
            const saved    = Math.max(0, remaining);
            const pct      = Math.min(100, (saved / budget.savings_goal) * 100);
            const achieved = pct >= 100;
            return (
              <>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Projected savings</span>
                  <span className={cn("font-semibold", achieved ? "text-emerald-600" : "text-foreground")}>
                    ₹{saved.toLocaleString()} / ₹{budget.savings_goal.toLocaleString()}
                  </span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-violet-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                {achieved && (
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3.5 w-3.5" />Goal achieved!
                  </p>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Set / Edit budget form */}
      {(!budget || editing) && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center">
              <PiggyBank className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{budget ? "Update Budget" : "Set Monthly Budget"}</h3>
              <p className="text-xs text-muted-foreground">For {format(new Date(), "MMMM yyyy")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget Amount (₹)</Label>
              <Input
                type="number" min="0"
                placeholder={budget ? String(budget.amount) : "e.g. 10000"}
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alert Threshold (%)</Label>
              <Input
                type="number" min="1" max="100" placeholder="80"
                value={threshold} onChange={(e) => setThreshold(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Savings Goal (₹)</Label>
              <Input
                type="number" min="0" placeholder="e.g. 2000"
                value={savingsGoal} onChange={(e) => setSavingsGoal(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} className="gradient-primary rounded-xl" disabled={upsertBudget.isPending}>
              {upsertBudget.isPending ? "Saving..." : budget ? "Update Budget" : "Set Budget"}
            </Button>
            {editing && (
              <Button variant="outline" className="rounded-xl" onClick={() => setEditing(false)}>Cancel</Button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
