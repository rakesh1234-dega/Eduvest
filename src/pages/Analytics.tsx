import { useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Wallet } from "lucide-react";
import { cn } from "@/utils/utils";

const PIE_COLORS = ["#7c3aed", "#ec4899", "#f97316", "#06b6d4", "#22c55e", "#ef4444", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-border p-3 text-xs min-w-[120px]">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium leading-5">
            {p.name}: ₹{Number(p.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: accounts, isLoading: accLoading } = useAccounts();

  const analytics = useMemo(() => {
    if (!transactions || !accounts) return null;
    const now = new Date();

    // 6-month monthly data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = format(startOfMonth(d), "yyyy-MM-dd");
      const end   = format(endOfMonth(d),   "yyyy-MM-dd");
      const slice = transactions.filter((t: any) => t.date >= start && t.date <= end);
      monthlyData.push({
        month:   format(d, "MMM"),
        Income:  slice.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0),
        Expense: slice.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0),
      });
    }

    // Category breakdown (current month)
    const start = format(startOfMonth(now), "yyyy-MM-dd");
    const end   = format(endOfMonth(now),   "yyyy-MM-dd");
    const monthExpTx = transactions.filter((t: any) => t.type === "expense" && t.date >= start && t.date <= end);
    const catMap: Record<string, number> = {};
    monthExpTx.forEach((t: any) => {
      const n = t.categories?.name || "Other";
      catMap[n] = (catMap[n] || 0) + t.amount;
    });
    const categoryData = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    const accountData = accounts.map((a) => ({
      name:    `${a.name}`,
      Balance: a.balance,
      type:    a.type,
    }));

    const totalIncome  = transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
    const totalExpense = transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);
    const netSavings   = totalIncome - totalExpense;

    return { monthlyData, categoryData, accountData, totalIncome, totalExpense, netSavings };
  }, [transactions, accounts]);

  if (txLoading || accLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
      </div>
    );
  }

  const statCards = [
    { label: "Total Income",   value: `₹${(analytics?.totalIncome  || 0).toLocaleString()}`, icon: TrendingUp,  bg: "bg-emerald-50", color: "text-emerald-600", valueColor: "text-emerald-600" },
    { label: "Total Expenses", value: `₹${(analytics?.totalExpense || 0).toLocaleString()}`, icon: TrendingDown, bg: "bg-rose-50",    color: "text-rose-500",    valueColor: "text-rose-500"    },
    { label: "Net Savings",    value: `₹${(analytics?.netSavings   || 0).toLocaleString()}`, icon: Wallet,       bg: "bg-violet-50",  color: "text-violet-600",  valueColor: "text-foreground"  },
  ];

  return (
    <div className="space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, color, valueColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center", bg)}>
                <Icon className={cn("h-5 w-5", color)} />
              </div>
            </div>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expense — Area chart */}
      <div className="bg-white rounded-2xl border border-border p-5 card-hover">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Income vs Expenses</h3>
            <p className="text-xs text-muted-foreground">Last 6 months overview</p>
          </div>
          <span className="text-xs bg-accent text-accent-foreground font-medium px-2.5 py-1 rounded-lg">Monthly</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={analytics?.monthlyData || []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aIncome"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="aExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Income"  name="Income"  stroke="#22c55e" strokeWidth={2} fill="url(#aIncome)"  dot={false} />
            <Area type="monotone" dataKey="Expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#aExpense)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-5 mt-1">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Income</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />Expense</span>
        </div>
      </div>

      {/* Bottom row: Category donut + Account balances bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Spending by Category */}
        <div className="bg-white rounded-2xl border border-border p-5 card-hover">
          <h3 className="font-semibold text-foreground mb-1">Spending by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">Current month breakdown</p>
          {analytics?.categoryData && analytics.categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.categoryData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80}>
                    {analytics.categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {analytics.categoryData.map((d, i) => {
                  const total = analytics.categoryData.reduce((s, x) => s + x.value, 0);
                  const pct   = total ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-xs text-muted-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-xs font-semibold text-foreground">₹{d.value.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">No expense data this month.</p>
          )}
        </div>

        {/* Account balances */}
        <div className="bg-white rounded-2xl border border-border p-5 card-hover">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Account Balances</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Current balances across all accounts</p>
          {analytics?.accountData && analytics.accountData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.accountData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Balance" name="Balance" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">No accounts yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
