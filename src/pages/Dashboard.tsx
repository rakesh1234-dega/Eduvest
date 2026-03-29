import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { useCurrentBudget } from "@/hooks/use-budgets";
import { useProfile } from "@/hooks/use-profile";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { StatCard } from "@/components/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet, Banknote, Smartphone, CreditCard,
  TrendingUp, TrendingDown, PiggyBank,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight,
  AlertTriangle, MoreHorizontal,
} from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const PIE_COLORS = ["#7c3aed", "#ec4899", "#f97316", "#06b6d4", "#22c55e", "#ef4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-border p-3 text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.dataKey === "income" ? "Income" : "Expense"}: ₹{Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accLoading } = useAccounts();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: budget } = useCurrentBudget();
  const navigate = useNavigate();

  useEffect(() => {
    // Handled in DashboardLayout now
  }, []);

  const stats = useMemo(() => {
    if (!accounts || !transactions) return null;
    const now = new Date();
    const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
    const monthTx = transactions.filter((t: any) => t.date >= monthStart && t.date <= monthEnd);

    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const cashBalance = accounts.filter((a) => a.type === "cash").reduce((s, a) => s + a.balance, 0);
    const upiBalance = accounts.filter((a) => a.type === "upi").reduce((s, a) => s + a.balance, 0);
    const cardBalance = accounts.filter((a) => a.type === "card").reduce((s, a) => s + a.balance, 0);
    const monthIncome = monthTx.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
    const monthExpense = monthTx.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);

    const categoryMap: Record<string, number> = {};
    monthTx.filter((t: any) => t.type === "expense").forEach((t: any) => {
      const name = t.categories?.name || "Other";
      categoryMap[name] = (categoryMap[name] || 0) + t.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Build a simple cash-flow chart for the last 7 months
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const s = format(startOfMonth(d), "yyyy-MM-dd");
      const e = format(endOfMonth(d), "yyyy-MM-dd");
      const slice = transactions.filter((t: any) => t.date >= s && t.date <= e);
      chartData.push({
        month: format(d, "MMM"),
        income: slice.filter((t: any) => t.type === "income").reduce((a: number, t: any) => a + t.amount, 0),
        expense: slice.filter((t: any) => t.type === "expense").reduce((a: number, t: any) => a + t.amount, 0),
      });
    }

    return { totalBalance, cashBalance, upiBalance, cardBalance, monthIncome, monthExpense, categoryData, chartData };
  }, [accounts, transactions]);

  const isLoading = accLoading || txLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const budgetUsed = stats?.monthExpense || 0;
  const budgetPercent = budget ? Math.min(100, (budgetUsed / budget.amount) * 100) : 0;
  const budgetWarning = budget && budgetPercent >= budget.alert_threshold;
  const budgetLeft = budget ? budget.amount - budgetUsed : 0;

  return (
    <div className="space-y-6">

      {/* ── Row 1: Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`₹${(stats?.totalBalance || 0).toLocaleString()}`}
          icon={Wallet}
          description="Available to use"
          accent
          className="lg:col-span-1"
        />
        <StatCard
          title="Monthly Income"
          value={`₹${(stats?.monthIncome || 0).toLocaleString()}`}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ value: "This month", positive: true }}
        />
        <StatCard
          title="Monthly Expenses"
          value={`₹${(stats?.monthExpense || 0).toLocaleString()}`}
          icon={TrendingDown}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          trend={{ value: "This month", positive: false }}
        />
        <StatCard
          title="Monthly Budget"
          value={budget ? `₹${budget.amount.toLocaleString()}` : "Not set"}
          icon={PiggyBank}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          description={budget ? `${budgetPercent.toFixed(0)}% used` : "Set in Budget page"}
        />
      </div>

      {/* ── Row 2: Account mini cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Cash",       value: stats?.cashBalance || 0, icon: Banknote,   bg: "icon-bg-green",  color: "text-emerald-700" },
          { label: "UPI",        value: stats?.upiBalance || 0,  icon: Smartphone, bg: "icon-bg-blue",   color: "text-blue-700"   },
          { label: "Card",       value: stats?.cardBalance || 0, icon: CreditCard, bg: "icon-bg-purple",  color: "text-violet-700" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-4 card-hover flex items-center gap-4">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <p className="text-lg font-bold text-foreground">₹{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 3: Cash Flow chart + Budget + Category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Cash Flow Area chart — spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5 card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Cash Flow</h3>
              <p className="text-xs text-muted-foreground">Income vs Expenses</p>
            </div>
            <span className="text-xs bg-accent text-accent-foreground font-medium px-2.5 py-1 rounded-lg">Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={stats?.chartData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income"  stroke="#7c3aed" strokeWidth={2} fill="url(#colorIncome)"  dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={2} fill="url(#colorExpense)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-violet-600 inline-block" />Income</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-pink-500 inline-block" />Expense</span>
          </div>
        </div>

        {/* Budget & Category stacked */}
        <div className="flex flex-col gap-4">
          {/* Budget card */}
          <div className="bg-white rounded-2xl border border-border p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-foreground">Budget</h3>
              <button className="text-xs text-primary hover:underline font-medium">See All ↗</button>
            </div>
            {budget ? (
              <>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold">₹{budgetUsed.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">of ₹{budget.amount.toLocaleString()}</p>
                  </div>
                  {budgetWarning && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      <AlertTriangle className="h-3 w-3" />
                      {budgetPercent >= 100 ? "Over!" : "Near limit"}
                    </span>
                  )}
                </div>
                {/* Progress bar */}
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      budgetPercent >= 100 ? "bg-rose-500" : budgetWarning ? "bg-amber-500" : "gradient-primary"
                    )}
                    style={{ width: `${budgetPercent}%` }}
                  />
                </div>
                <p className={cn(
                  "text-xs mt-1.5 font-medium",
                  budgetLeft < 0 ? "text-rose-500" : "text-emerald-600"
                )}>
                  {budgetLeft < 0 ? `₹${Math.abs(budgetLeft).toLocaleString()} over budget` : `₹${budgetLeft.toLocaleString()} remaining`}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No budget set for this month.</p>
            )}
          </div>

          {/* Category donut */}
          <div className="bg-white rounded-2xl border border-border p-5 card-hover flex-1">
            <h3 className="font-semibold text-sm text-foreground mb-3">Spending by Category</h3>
            {stats?.categoryData && stats.categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={stats.categoryData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55}>
                      {stats.categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-1">
                  {stats.categoryData.slice(0, 3).map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-muted-foreground truncate max-w-[80px]">{d.name}</span>
                      </span>
                      <span className="font-medium">₹{d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">No expense data this month.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 4: Recent Transactions ── */}
      <div className="bg-white rounded-2xl border border-border p-5 card-hover">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Transactions</h3>
          <button
            onClick={() => navigate("/transactions")}
            className="text-xs text-primary hover:underline font-medium"
          >See More ↗</button>
        </div>

        {transactions && transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Description</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-3 hidden md:table-cell">Account</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground pb-3">Date</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 6).map((tx: any, i: number) => (
                  <tr key={tx.id} className={cn("border-b border-border/50 hover:bg-muted/30 transition-colors", i === 5 && "border-0")}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                          tx.type === "income" ? "bg-emerald-50" : tx.type === "expense" ? "bg-rose-50" : "bg-blue-50"
                        )}>
                          {tx.type === "income"
                            ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                            : tx.type === "expense"
                            ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                            : <ArrowLeftRight className="h-3.5 w-3.5 text-blue-500" />}
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {tx.description || tx.categories?.name || tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 hidden sm:table-cell">
                      {tx.categories?.name
                        ? <span className="inline-block text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-md font-medium">{tx.categories.name}</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="py-3 hidden md:table-cell text-xs text-muted-foreground">{tx.accounts?.name ?? "—"}</td>
                    <td className="py-3 text-xs text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</td>
                    <td className={cn(
                      "py-3 text-right font-semibold text-sm",
                      tx.type === "income" ? "text-emerald-600" : tx.type === "expense" ? "text-rose-500" : "text-blue-500"
                    )}>
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowLeftRight className="h-10 w-10 mx-auto mb-3 text-muted" />
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs mt-1">Start recording your income and expenses.</p>
          </div>
        )}
      </div>

    </div>
  );
}
