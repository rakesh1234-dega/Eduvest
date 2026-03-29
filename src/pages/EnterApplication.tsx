import { useState, useMemo } from "react";
import { useAccounts, useCreateAccount } from "@/hooks/use-accounts";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useUpsertBudget, useCurrentBudget } from "@/hooks/use-budgets";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Wallet, PiggyBank, ArrowLeftRight, BarChart3, Plus, Check } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AccountType = Database["public"]["Enums"]["account_type"];
type TxType = Database["public"]["Enums"]["transaction_type"];

export default function EnterApplicationPage() {
  // Account form
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState<AccountType>("cash");
  const [accBalance, setAccBalance] = useState("");
  const [accDefault, setAccDefault] = useState(false);
  const [accDesc, setAccDesc] = useState("");

  // Budget form
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetThreshold, setBudgetThreshold] = useState("80");
  const [budgetSavings, setBudgetSavings] = useState("");

  // Transaction form
  const [txType, setTxType] = useState<TxType>("expense");
  const [txAmount, setTxAmount] = useState("");
  const [txDesc, setTxDesc] = useState("");
  const [txDate, setTxDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [txAccountId, setTxAccountId] = useState("");
  const [txToAccountId, setTxToAccountId] = useState("");
  const [txCategoryId, setTxCategoryId] = useState("");

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: budget } = useCurrentBudget();
  const { data: transactions } = useTransactions();
  const createAccount = useCreateAccount();
  const createTx = useCreateTransaction();
  const upsertBudget = useUpsertBudget();

  const summary = useMemo(() => {
    if (!accounts) return { cash: 0, upi: 0, card: 0, bank: 0, total: 0 };
    const cash = accounts.filter((a) => a.type === "cash").reduce((s, a) => s + a.balance, 0);
    const upi = accounts.filter((a) => a.type === "upi").reduce((s, a) => s + a.balance, 0);
    const card = accounts.filter((a) => a.type === "card").reduce((s, a) => s + a.balance, 0);
    const bank = accounts.filter((a) => a.type === "bank").reduce((s, a) => s + a.balance, 0);
    return { cash, upi, card, bank, total: cash + upi + card + bank };
  }, [accounts]);

  const handleCreateAccount = async () => {
    if (!accName) { toast.error("Enter account name"); return; }
    await createAccount.mutateAsync({
      name: accName, type: accType, balance: parseFloat(accBalance) || 0, is_default: accDefault, description: accDesc || undefined,
    });
    setAccName(""); setAccBalance(""); setAccDesc(""); setAccDefault(false);
  };

  const handleSaveBudget = async () => {
    const amt = parseFloat(budgetAmount);
    if (!amt || amt <= 0) { toast.error("Enter valid budget"); return; }
    await upsertBudget.mutateAsync({
      amount: amt, month: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      alert_threshold: parseInt(budgetThreshold) || 80, savings_goal: parseFloat(budgetSavings) || 0,
    });
    setBudgetAmount("");
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
    setTxAmount(""); setTxDesc("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Enter Application</h1>
        <p className="text-muted-foreground text-sm">Manage all your financial data in one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form area */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="accounts">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="accounts" className="gap-1"><Wallet className="h-3.5 w-3.5" /> Accounts</TabsTrigger>
              <TabsTrigger value="budget" className="gap-1"><PiggyBank className="h-3.5 w-3.5" /> Budget</TabsTrigger>
              <TabsTrigger value="transactions" className="gap-1"><ArrowLeftRight className="h-3.5 w-3.5" /> Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Create Account</CardTitle>
                  <CardDescription>Add a new money account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Account Name</Label>
                      <Input placeholder="e.g. My Wallet" value={accName} onChange={(e) => setAccName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select value={accType} onValueChange={(v) => setAccType(v as AccountType)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">💵 Cash</SelectItem>
                          <SelectItem value="upi">📱 UPI</SelectItem>
                          <SelectItem value="card">💳 Card</SelectItem>
                          <SelectItem value="bank">🏦 Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Opening Balance (₹)</Label>
                      <Input type="number" min="0" placeholder="0" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Description (optional)</Label>
                      <Input placeholder="Notes..." value={accDesc} onChange={(e) => setAccDesc(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={accDefault} onCheckedChange={setAccDefault} />
                    <Label>Set as default</Label>
                  </div>
                  <Button onClick={handleCreateAccount} className="gradient-primary gap-1" disabled={createAccount.isPending}>
                    <Plus className="h-4 w-4" /> {createAccount.isPending ? "Creating..." : "Create Account"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="budget">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Budget Setup</CardTitle>
                  <CardDescription>Set your monthly spending limit for {format(new Date(), "MMMM yyyy")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label>Monthly Budget (₹)</Label>
                      <Input type="number" min="0" placeholder={budget ? String(budget.amount) : "5000"} value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Alert at (%)</Label>
                      <Input type="number" min="1" max="100" value={budgetThreshold} onChange={(e) => setBudgetThreshold(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>Savings Goal (₹)</Label>
                      <Input type="number" min="0" placeholder="1000" value={budgetSavings} onChange={(e) => setBudgetSavings(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleSaveBudget} className="gradient-primary" disabled={upsertBudget.isPending}>
                    {upsertBudget.isPending ? "Saving..." : budget ? "Update Budget" : "Set Budget"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Add Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={txType} onValueChange={(v) => setTxType(v as TxType)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
                      <TabsTrigger value="expense" className="flex-1">Expense</TabsTrigger>
                      <TabsTrigger value="transfer" className="flex-1">Transfer</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Amount (₹)</Label>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>{txType === "transfer" ? "From Account" : "Account"}</Label>
                      <Select value={txAccountId} onValueChange={setTxAccountId}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {txType === "transfer" && (
                      <div className="space-y-1">
                        <Label>To Account</Label>
                        <Select value={txToAccountId} onValueChange={setTxToAccountId}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {accounts?.filter((a) => a.id !== txAccountId).map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {txType !== "transfer" && (
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            {categories?.filter((c) => c.type === txType).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Date</Label>
                      <Input type="date" value={txDate} onChange={(e) => setTxDate(e.target.value)} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>Note</Label>
                      <Input placeholder="What was this for?" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleCreateTx} className="gradient-primary gap-1" disabled={createTx.isPending}>
                    <Plus className="h-4 w-4" /> {createTx.isPending ? "Adding..." : "Add Transaction"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right side summary */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Quick Summary</CardTitle></CardHeader>
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
              <CardHeader className="pb-2"><CardTitle className="text-sm">Budget Progress</CardTitle></CardHeader>
              <CardContent>
                <Progress value={Math.min(100, ((transactions?.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0) || 0) / budget.amount) * 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">₹{budget.amount.toLocaleString()} budget</p>
              </CardContent>
            </Card>
          )}

          {accounts && accounts.length > 0 && (
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Your Accounts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{acc.name}</span>
                    <Badge variant="secondary">₹{acc.balance.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
