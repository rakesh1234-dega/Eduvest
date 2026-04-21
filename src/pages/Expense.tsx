import { useState, useMemo } from "react";
import { useAccounts, useCreateAccount } from "@/hooks/use-accounts";
import { useCreateTransaction, useTransactions } from "@/hooks/use-transactions";
import { useCurrentBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Wallet, ArrowLeftRight, BarChart3, Plus, TrendingDown, TrendingUp,
  ArrowUpRight, ArrowDownRight, Coffee, Bus, ShoppingBag, Zap, Utensils,
  Smartphone, BookOpen, Gamepad2, Heart, Clock
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/utils/utils";

type AccountType = Database["public"]["Enums"]["account_type"];
type TxType = Database["public"]["Enums"]["transaction_type"];

const QUICK_CATEGORIES = [
  { label: "Food", icon: Utensils, color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" },
  { label: "Transport", icon: Bus, color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" },
  { label: "Shopping", icon: ShoppingBag, color: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800" },
  { label: "Coffee", icon: Coffee, color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800" },
  { label: "Phone", icon: Smartphone, color: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800" },
  { label: "Education", icon: BookOpen, color: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800" },
  { label: "Entertainment", icon: Gamepad2, color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" },
  { label: "Health", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800" },
];

export default function ExpensePage() {
  const [txType, setTxType] = useState<TxType>("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txDate, setTxDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [txAccountId, setTxAccountId] = useState("");
  const [txToAccountId, setTxToAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");
  const [quickCategory, setQuickCategory] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<AccountType>("cash");
  const [accBalance, setAccBalance] = useState("");

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: budget } = useCurrentBudget();
  const { data: transactions } = useTransactions();
  const createAccount = useCreateAccount();
  const createTx = useCreateTransaction();

  const summary = useMemo(() => {
    if (!accounts) return { cash: 0, upi: 0, card: 0, bank: 0, total: 0 };
    const cash = accounts.filter((a) => a.type === "cash").reduce((s, a) => s + a.balance, 0);
    const upi = accounts.filter((a) => a.type === "upi").reduce((s, a) => s + a.balance, 0);
    const card = accounts.filter((a) => a.type === "card").reduce((s, a) => s + a.balance, 0);
    const bank = accounts.filter((a) => a.type === "bank").reduce((s, a) => s + a.balance, 0);
    return { cash, upi, card, bank, total: cash + upi + card + bank };
  }, [accounts]);

  const monthlyExpenses = useMemo(() => {
    if (!transactions) return 0;
    return transactions.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0);
  }, [transactions]);

  const monthlyIncome = useMemo(() => {
    if (!transactions) return 0;
    return transactions.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0);
  }, [transactions]);

  const recentTx = useMemo(() => {
    if (!transactions) return [];
    return transactions.slice(0, 5);
  }, [transactions]);

  const budgetUsedPercent = budget ? Math.min(100, (monthlyExpenses / budget.amount) * 100) : 0;

  const handleQuickCategory = (label: string) => {
    setQuickCategory(label);
    setTxType("expense");
    setTxDesc(label);
    if (categories) {
      const match = categories.find((c) => c.name.toLowerCase().includes(label.toLowerCase()) && c.type === "expense");
      if (match) setTxCategoryId(match.id);
    }
  };

  const handleCreateTx = async () => {
    if (!txAmount || parseFloat(txAmount) <= 0) { toast.error("Enter valid amount"); return; }
    if (!txAccountId) { toast.error("Select account"); return; }
    if (txType === "transfer" && !txToAccountId) { toast.error("Select destination"); return; }
    if (txType === "transfer" && txAccountId === txToAccountId) { toast.error("Cannot transfer to same account"); return; }
    await createTx.mutateAsync({
      type: txType, amount: parseFloat(txAmount), description: txDesc || undefined,
      date: txDate, account_id: txAccountId,
      to_account_id: txType === "transfer" ? txToAccountId : undefined,
      category_id: txCategoryId || undefined,
    });
    toast.success("Transaction logged! 🎉");
    setTxAmount(""); setTxDesc(""); setQuickCategory("");
  };

  const handleCreateAccount = async () => {
    if (!accName) { toast.error("Enter account name"); return; }
    await createAccount.mutateAsync({
      name: accName, type: accType, balance: parseFloat(accBalance) || 0, is_default: false,
    });
    toast.success("Account created!");
    setAccName(""); setAccBalance(""); setShowAddAccount(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expense Tracker</h1>
        <p className="text-muted-foreground text-sm">Log transactions and manage your money in one place.</p>
      </div>

      {/* Live Balance Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wide">Total Balance</p>
          <p className="text-2xl font-bold mt-1">₹{summary.total.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-emerald-500" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Income</p>
              <p className="text-sm font-bold text-emerald-600">+₹{monthlyIncome.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center"><TrendingDown className="h-4 w-4 text-rose-500" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Expenses</p>
              <p className="text-sm font-bold text-rose-500">-₹{monthlyExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center"><Wallet className="h-4 w-4 text-indigo-500" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase">Budget Left</p>
              <p className="text-sm font-bold text-indigo-600">{budget ? `₹${Math.max(0, budget.amount - monthlyExpenses).toLocaleString()}` : "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Quick Category Chips */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4 text-amber-500" /> Quick Expense</CardTitle>
              <p className="text-xs text-muted-foreground">Tap a category to quickly log a common expense</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_CATEGORIES.map((cat) => (
                  <button key={cat.label} onClick={() => handleQuickCategory(cat.label)}
                    className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.03] hover:shadow-md active:scale-95",
                      quickCategory === cat.label ? "ring-2 ring-indigo-500 shadow-md " + cat.color : cat.color + " opacity-80 hover:opacity-100"
                    )}>
                    <cat.icon className="h-5 w-5" />
                    <span className="text-[11px] font-semibold">{cat.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Form */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-indigo-500" /> Add Transaction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {(["expense", "income", "transfer"] as TxType[]).map((t) => (
                  <button key={t} onClick={() => setTxType(t)}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border",
                      txType === t
                        ? t === "expense" ? "bg-rose-500 text-white border-rose-500 shadow-md"
                        : t === "income" ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                        : "bg-blue-500 text-white border-blue-500 shadow-md"
                        : "bg-muted text-muted-foreground border-border hover:bg-accent"
                    )}>
                    {t === "expense" ? "💸 Expense" : t === "income" ? "💰 Income" : "🔄 Transfer"}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount (₹)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} className="h-12 text-lg font-bold rounded-xl" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{txType === "transfer" ? "From Account" : "Account"}</Label>
                  <Select value={txAccountId} onValueChange={setTxAccountId}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>{accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {txType === "transfer" && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To Account</Label>
                    <Select value={txToAccountId} onValueChange={setTxToAccountId}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{accounts?.filter((a) => a.id !== txAccountId).map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {txType !== "transfer" && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
                    <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{categories?.filter((c) => c.type === txType).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</Label>
                  <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Note</Label>
                  <Input placeholder="What was this for?" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} className="h-12 rounded-xl" />
                </div>
              </div>
              <Button onClick={handleCreateTx} disabled={createTx.isPending}
                className={cn("w-full h-12 rounded-xl font-bold text-base gap-2 shadow-md transition-all",
                  txType === "expense" ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : txType === "income" ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
                )}>
                <Plus className="h-5 w-5" />
                {createTx.isPending ? "Adding..." : txType === "expense" ? "Log Expense" : txType === "income" ? "Log Income" : "Transfer"}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Recent Activity</CardTitle></CardHeader>
            <CardContent>
              {recentTx.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No transactions yet. Start logging above!</p>
              ) : (
                <div className="space-y-2">
                  {recentTx.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center",
                          tx.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/30" : tx.type === "expense" ? "bg-rose-50 dark:bg-rose-900/30" : "bg-blue-50 dark:bg-blue-900/30"
                        )}>
                          {tx.type === "income" ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> :
                           tx.type === "expense" ? <ArrowDownRight className="h-4 w-4 text-rose-500" /> :
                           <ArrowLeftRight className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{tx.description || tx.type}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(tx.date), "MMM d")} • {tx.categories?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                      <span className={cn("text-sm font-bold", tx.type === "income" ? "text-emerald-600" : "text-rose-500")}>
                        {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Summary */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-500" /> Balances</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">💵 Cash</span><span className="font-semibold">₹{summary.cash.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">📱 UPI</span><span className="font-semibold">₹{summary.upi.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">💳 Card</span><span className="font-semibold">₹{summary.card.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">🏦 Bank</span><span className="font-semibold">₹{summary.bank.toLocaleString()}</span></div>
              <Separator />
              <div className="flex justify-between"><span className="font-medium">Total</span><span className="font-bold text-lg gradient-text">₹{summary.total.toLocaleString()}</span></div>
            </CardContent>
          </Card>

          {budget && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  Budget Progress
                  <Badge variant={budgetUsedPercent > 80 ? "destructive" : "secondary"} className="text-[10px]">{Math.round(budgetUsedPercent)}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={budgetUsedPercent} className="h-2.5 rounded-full" />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-muted-foreground">Spent: ₹{monthlyExpenses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">of ₹{budget.amount.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Your Accounts</CardTitle>
                <Button size="sm" variant="ghost" className="text-xs text-indigo-600 hover:text-indigo-700" onClick={() => setShowAddAccount(!showAddAccount)}>
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {showAddAccount && (
                <div className="space-y-2 p-3 bg-muted rounded-xl border border-border mb-3">
                  <Input placeholder="Account name" value={accName} onChange={(e) => setAccName(e.target.value)} className="h-9 rounded-lg text-sm" />
                  <Select value={accType} onValueChange={(v) => setAccType(v as AccountType)}>
                    <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="upi">📱 UPI</SelectItem>
                      <SelectItem value="card">💳 Card</SelectItem>
                      <SelectItem value="bank">🏦 Bank</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="Balance" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} className="h-9 rounded-lg text-sm" />
                  <Button size="sm" onClick={handleCreateAccount} disabled={createAccount.isPending} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-9">
                    {createAccount.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              )}
              {(!accounts || accounts.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">No accounts yet.</p>
              ) : accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-sm py-1.5">
                  <span className="text-muted-foreground">{acc.name}</span>
                  <Badge variant="secondary" className="font-bold">₹{acc.balance.toLocaleString()}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg">
            <h3 className="font-bold text-sm mb-2">💡 Quick Tip</h3>
            <p className="text-indigo-100 text-xs leading-relaxed">
              Log every expense as it happens — even ₹10 for chai! Small expenses add up fast and are the #1 reason students overspend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
