import { useState, useMemo } from "react";
import { useCurrentBudget, useUpsertBudget } from "@/hooks/use-budgets";
import { useTransactions } from "@/hooks/use-transactions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, TrendingDown, Target, PiggyBank, Edit3, CheckCircle, Lightbulb, Info, ShieldCheck, Wallet, Calendar, ArrowUpRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import { generateMonthlyReview, BudgetReviewInsight } from "@/utils/budget-engine";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function BudgetPage() {
  const { data: budget, isLoading } = useCurrentBudget();
  const { data: transactions } = useTransactions();
  const upsertBudget = useUpsertBudget();
  
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("80");
  const [savingsGoal, setSavingsGoal] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Derived state
  const now = new Date();
  const start = format(startOfMonth(now), "yyyy-MM-dd");
  const end = format(endOfMonth(now), "yyyy-MM-dd");
  
  const currentMonthTransactions = useMemo(() => {
    return (transactions || []).filter((t: any) => t.date >= start && t.date <= end);
  }, [transactions, start, end]);

  const monthExpenses = useMemo(() => {
    return currentMonthTransactions
      .filter((t: any) => t.type === "expense")
      .reduce((s: number, t: any) => s + t.amount, 0);
  }, [currentMonthTransactions]);

  const topDrains = useMemo(() => {
    return currentMonthTransactions
      .filter((t: any) => t.type === "expense")
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 3);
  }, [currentMonthTransactions]);

  const categoryBreakdown = useMemo(() => {
    const expenses = currentMonthTransactions.filter((t: any) => t.type === "expense");
    const grouped: Record<string, { value: number, color: string }> = {};
    expenses.forEach((t: any) => {
      const catName = t.categories?.name || "Uncategorized";
      const catColor = t.categories?.color || "#94a3b8";
      if (!grouped[catName]) {
        grouped[catName] = { value: 0, color: catColor };
      }
      grouped[catName].value += t.amount;
    });
    return Object.entries(grouped)
      .map(([name, data]) => ({ name, value: data.value, color: data.color }))
      .sort((a, b) => b.value - a.value);
  }, [currentMonthTransactions]);

  // Budget calculations
  const budgetPercent = budget ? Math.min(100, (monthExpenses / budget.amount) * 100) : 0;
  const remaining = budget ? budget.amount - monthExpenses : 0;
  const isOver = remaining < 0;
  const isWarning = budget && budgetPercent >= budget.alert_threshold;

  // Daily Allowance Calculation
  const daysInMonth = differenceInDays(endOfMonth(now), startOfMonth(now)) + 1;
  const daysPassed = differenceInDays(now, startOfMonth(now)) + 1;
  const daysRemaining = differenceInDays(endOfMonth(now), now);
  const dailyAllowance = remaining > 0 && daysRemaining > 0 ? remaining / daysRemaining : 0;

  const handleEditOpen = () => {
    if (budget) {
      setAmount(String(budget.amount));
      setThreshold(String(budget.alert_threshold));
      setSavingsGoal(String(budget.savings_goal || ""));
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid budget amount"); return; }
    await upsertBudget.mutateAsync({
      amount: amt,
      month: start,
      alert_threshold: parseInt(threshold) || 80,
      savings_goal: parseFloat(savingsGoal) || 0,
    });
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Skeleton className="h-64 rounded-3xl" />
           <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const barColor = budgetPercent >= 100 ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500";

  // If no budget is set, showing a welcome screen to set it
  if (!budget && !upsertBudget.isPending && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto">
        <div className="h-20 w-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
          <Wallet className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Take Control of Your Spending</h2>
        <p className="text-muted-foreground mb-8">Set a monthly budget to unlock actionable insights, track savings goals, and monitor daily limits.</p>
        
        <div className="w-full bg-card p-6 rounded-3xl border shadow-sm text-left">
          <h3 className="font-semibold mb-4 text-foreground">Set Your First Budget</h3>
          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <Label>Monthly Budget Amount (₹)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 15000" className="text-lg" />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full gradient-primary rounded-xl h-12 text-md font-semibold">Start Budgeting</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Active Budget</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-4 w-4" /> {format(now, "MMMM yyyy")}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleEditOpen} className="gradient-primary text-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Limits
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>Update Monthly Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Budget Amount (₹)</Label>
                <Input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label>Alert Threshold (%)</Label>
                <Input type="number" min="1" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} />
                <p className="text-xs text-muted-foreground">We'll alert you when spending hits this percentage.</p>
              </div>
              <div className="space-y-2">
                <Label>Savings Goal (₹)</Label>
                <Input type="number" min="0" value={savingsGoal} onChange={e => setSavingsGoal(e.target.value)} />
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-border/50">
              <Button variant="ghost" className="rounded-xl" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-xl">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Main Budget Progress Card (Left Column, span 8) */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-card rounded-[2rem] border border-border/50 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px] -z-10 translate-x-1/3 -translate-y-1/3" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5" /> Total Limit
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight py-1">₹{budget?.amount.toLocaleString()}</h2>
                </div>
              </div>
              
              {isWarning && (
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl border font-semibold animate-in fade-in zoom-in",
                  isOver ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800"
                )}>
                  <AlertTriangle className="h-5 w-5" />
                  {isOver ? "Limit Exceeded" : "Approaching Limit"}
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8 z-10 relative">
              <div className="flex justify-between items-end text-sm">
                <div>
                  <span className="font-bold text-xl text-foreground">₹{monthExpenses.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-2 font-medium">spent</span>
                </div>
                <div className="text-right">
                  <span className={cn("font-bold text-xl", isOver ? "text-rose-500" : "text-emerald-500")}>
                    {isOver ? `-₹${Math.abs(remaining).toLocaleString()}` : `₹${remaining.toLocaleString()}`}
                  </span>
                  <span className="text-muted-foreground ml-2 font-medium">{isOver ? "over" : "left"}</span>
                </div>
              </div>
              <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground">
                <span>0%</span>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg border", 
                  isWarning ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800" : "bg-primary/5 text-primary border-primary/20 dark:bg-primary/20"
                )}>
                  {budgetPercent.toFixed(1)}% Consumed
                </span>
                <span>100%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border/60">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Expenses</p>
                <p className="text-xl font-bold">{currentMonthTransactions.filter((t:any) => t.type === 'expense').length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Daily Avg</p>
                <p className="text-xl font-bold">₹{Math.round(monthExpenses / Math.max(1, daysPassed)).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Alert Info</p>
                <p className="text-xl font-bold text-amber-500">{budget?.alert_threshold}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Savings Goal</p>
                <p className="text-xl font-bold text-violet-500">{budget?.savings_goal ? `₹${budget.savings_goal.toLocaleString()}` : "-"}</p>
              </div>
            </div>
          </div>

          {/* Breakdown and Top Drains Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Chart */}
            <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" /> Spending by Category
              </h3>
              {categoryBreakdown.length > 0 ? (
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        stroke="transparent"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Legend */}
                  <div className="flex flex-wrap gap-2.5 justify-center mt-3">
                    {categoryBreakdown.slice(0,4).map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-muted-foreground truncate max-w-[80px]">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed rounded-2xl bg-slate-50 dark:bg-slate-900/20">
                  <span className="opacity-60">No expenses recorded yet.</span>
                </div>
              )}
            </div>

            {/* Top Drains */}
            <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-foreground">Top Expense Drains</h3>
                <TrendingDown className="h-5 w-5 text-rose-500" />
              </div>
              <div className="flex-1 space-y-3">
                {topDrains.length > 0 ? topDrains.map((tx: any, idx: number) => (
                  <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-transform group-hover:scale-105">
                        {tx.categories?.icon || "💸"}
                      </div>
                      <div>
                        <p className="font-bold text-sm truncate max-w-[120px] text-foreground leading-tight mb-0.5">{tx.description || tx.categories?.name || "Expense"}</p>
                        <p className="text-[11px] text-muted-foreground font-medium flex gap-1 items-center">
                          <Calendar className="h-3 w-3" /> {format(new Date(tx.date), "MMM dd")}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-rose-500 text-sm">-₹{tx.amount.toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                      <ShieldCheck className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Great Job!</p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">No major drains detected this month.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Side Column (Right, span 4) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Daily Allowance Card */}
          <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
              <Wallet className="h-32 w-32 translate-x-8 -translate-y-8" />
            </div>
            
            <div className="relative z-10">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1.5 opacity-90">Safe To Spend</p>
              <h3 className="text-5xl font-black mb-1 tracking-tight">
                ₹{dailyAllowance > 0 ? Math.floor(dailyAllowance).toLocaleString() : "0"}
              </h3>
              <p className="text-indigo-200 text-sm font-semibold mb-8">/ day for remaining {daysRemaining} days</p>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-inner">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-100 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-50 leading-relaxed font-medium">
                    {dailyAllowance > 0 
                      ? "Stick to this daily limit to avoid exceeding your monthly budget thresholds." 
                      : "You've exceeded your budget. Restrict spending strictly to absolute essentials."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Review Engine Insights */}
          <div className="bg-card rounded-3xl border border-border/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">AI Budget Insights</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Pattern Analysis</p>
              </div>
            </div>
            
            {transactions ? (
              <div className="space-y-5">
                {generateMonthlyReview(budget?.amount || 0, monthExpenses, budget?.savings_goal || 0, currentMonthTransactions).map((insight: BudgetReviewInsight, idx: number) => {
                  const iconMap = {
                    warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
                    success: <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />,
                    info:    <Info className="h-4 w-4 text-sky-500 shrink-0" />,
                  };
                  const bgMap = {
                    warning: "bg-amber-100 dark:bg-amber-900/50",
                    success: "bg-emerald-100 dark:bg-emerald-900/50",
                    info:    "bg-sky-100 dark:bg-sky-900/50",
                  };
                  return (
                    <div key={idx} className="flex gap-4 group">
                      <div className="mt-1">
                        <div className={cn("p-1.5 rounded-lg shadow-sm border border-black/5 dark:border-white/5", bgMap[insight.type])}>
                          {iconMap[insight.type]}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-snug mb-1">{insight.title}</p>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
