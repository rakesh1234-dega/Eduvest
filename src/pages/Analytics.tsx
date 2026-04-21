import { useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Wallet, Download } from "lucide-react";
import { cn } from "@/utils/utils";
import { useProfile } from "@/hooks/use-profile";
import { useCurrentBudget } from "@/hooks/use-budgets";
import { generateMonthlyPDF } from "@/utils/pdfGenerator";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#f43f5e", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border p-4 min-w-[150px]">
        {label && <p className="font-bold text-slate-700 mb-2">{label}</p>}
        <div className="space-y-2">
          {payload.map((p: any) => (
            <div key={p.dataKey || p.name} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.color || p.payload?.fill }}></span>
                {p.name || p.dataKey}
              </span>
              <span className="text-sm font-bold text-foreground">
                ₹{Number(p.value).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: accounts, isLoading: accLoading } = useAccounts();
  const { data: profile } = useProfile();
  const { data: budget } = useCurrentBudget();

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
      <div className="flex justify-end">
        <Button 
          onClick={() => generateMonthlyPDF(profile, transactions || [], accounts || [], budget)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Download className="h-4 w-4" /> Download Monthly Report
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, bg, color, valueColor }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-5 card-hover">
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
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-lg text-foreground">Income vs Expenses</h3>
            <p className="text-sm text-muted-foreground font-medium">Last 6 months overview</p>
          </div>
          <span className="text-xs bg-muted text-muted-foreground font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Monthly</span>
        </div>
        {analytics?.monthlyData && analytics.monthlyData.some((d: any) => d.Income > 0 || d.Expense > 0) ? (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" name="Income" dataKey="Income" stroke="#10b981" strokeWidth={3} fill="url(#aIncome)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }} />
                  <Area type="monotone" name="Expense" dataKey="Expense" stroke="#f43f5e" strokeWidth={3} fill="url(#aExpense)" dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6, strokeWidth: 0, fill: "#f43f5e" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4 justify-center">
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />Income</span>
              <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><span className="h-3 w-3 rounded-full bg-rose-500 shadow-sm" />Expense</span>
            </div>
          </>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
            <TrendingUp className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">No cash flow data available.</p>
            <p className="text-xs mt-1">Add your first transaction to see the trend.</p>
          </div>
        )}
      </div>

      {/* Bottom row: Category donut + Account balances bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Spending by Category */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg text-foreground mb-1">Spending by Category</h3>
          <p className="text-sm text-muted-foreground font-medium mb-6">Current month breakdown</p>
          {analytics?.categoryData && analytics.categoryData.length > 0 ? (
            <>
              <div className="relative h-[250px] w-full mb-6 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={analytics.categoryData} 
                      dataKey="value" 
                      nameKey="name"
                      cx="50%" cy="50%" 
                      innerRadius={70} 
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {analytics.categoryData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-extrabold text-foreground mt-1">
                    ₹{analytics.categoryData.reduce((s:number, x:any) => s + x.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {analytics.categoryData.map((d, i) => {
                  const total = analytics.categoryData.reduce((s:number, x:any) => s + x.value, 0);
                  const pct   = total ? Math.round((d.value / total) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full shadow-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm font-medium text-muted-foreground flex-1 truncate">{d.name}</span>
                      <span className="text-sm font-bold text-foreground">₹{d.value.toLocaleString()}</span>
                      <span className="text-xs font-semibold text-slate-400 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">No expense data this month.</div>
          )}
        </div>

        {/* Account balances */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-100 p-2 rounded-lg"><BarChart3 className="h-5 w-5 text-blue-600" /></div>
            <h3 className="font-bold text-lg text-foreground">Account Balances</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-6">Current balances across all registered accounts</p>
          {analytics?.accountData && analytics.accountData.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.accountData} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                  <Bar dataKey="Balance" name="Balance" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={32}>
                    {analytics.accountData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={["#8b5cf6", "#10b981", "#f59e0b", "#ec4899"][index % 4]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm font-medium">No accounts yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
