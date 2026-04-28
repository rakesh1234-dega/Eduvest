import { useState } from "react";
import { useTransactions, useCreateTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useProfile, useAddPoints } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { TransactionTable } from "@/components/TransactionTable";
import {
  Plus, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2, Search,
  TrendingUp, TrendingDown, SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/utils/utils";
import type { Database } from "@/integrations/supabase/types";

type TxType = Database["public"]["Enums"]["transaction_type"];

const TYPE_CONFIG = {
  income: { icon: ArrowUpRight, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badge: "badge-income", label: "Income" },
  expense: { icon: ArrowDownRight, iconBg: "bg-rose-50", iconColor: "text-rose-500", badge: "badge-expense", label: "Expense" },
  transfer: { icon: ArrowLeftRight, iconBg: "bg-blue-50", iconColor: "text-blue-500", badge: "badge-transfer", label: "Transfer" },
};

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);
  const [txType, setTxType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: profile } = useProfile();
  const addPoints = useAddPoints();
  const createTx = useCreateTransaction();
  const deleteTx = useDeleteTransaction();

  const handleCreate = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!accountId) { toast.error("Select an account"); return; }
    if (txType === "transfer" && !toAccountId) { toast.error("Select destination account"); return; }
    if (txType === "transfer" && accountId === toAccountId) { toast.error("Cannot transfer to same account"); return; }
    await createTx.mutateAsync({
      type: txType, amount: parseFloat(amount),
      description: description || undefined, date,
      account_id: accountId,
      to_account_id: txType === "transfer" ? toAccountId : undefined,
      category_id: categoryId || undefined,
    });
    setOpen(false); setAmount(""); setDescription(""); setCategoryId("");

    // Gamification Celebration
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b']
      });
    });

    // Award 10 points via Supabase hook + activity log
    try {
      await addPoints.mutateAsync({ points: 10, activityName: "transaction_created" });
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Transaction Added!</span>
          <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">⭐ +10 Points Earned</span>
        </div>
      );
    } catch {
      toast.success("Transaction Added!");
    }
  };

  // Quick stats
  const totalIncome = transactions?.filter((t: any) => t.type === "income").reduce((s: number, t: any) => s + t.amount, 0) || 0;
  const totalExpense = transactions?.filter((t: any) => t.type === "expense").reduce((s: number, t: any) => s + t.amount, 0) || 0;

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 card-hover">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Income</p>
            <p className="text-xl font-bold text-emerald-600">+₹{totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 card-hover">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Expenses</p>
            <p className="text-xl font-bold text-rose-500">-₹{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <TransactionTable
        transactions={transactions || []}
        isLoading={isLoading}
        headerAction={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary gap-2 rounded-xl h-10 px-4">
                <Plus className="h-4 w-4" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined} className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">New Transaction</DialogTitle>
              </DialogHeader>
              <Tabs value={txType} onValueChange={(v) => setTxType(v as TxType)}>
                <TabsList className="w-full rounded-xl bg-muted p-1">
                  <TabsTrigger value="income" className="flex-1 rounded-lg text-xs font-medium">Income</TabsTrigger>
                  <TabsTrigger value="expense" className="flex-1 rounded-lg text-xs font-medium">Expense</TabsTrigger>
                  <TabsTrigger value="transfer" className="flex-1 rounded-lg text-xs font-medium">Transfer</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="space-y-3 mt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount (₹)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{txType === "transfer" ? "From Account" : "Account"}</Label>
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select account" /></SelectTrigger>
                    <SelectContent>{accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {txType === "transfer" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">To Account</Label>
                    <Select value={toAccountId} onValueChange={setToAccountId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select destination" /></SelectTrigger>
                      <SelectContent>{accounts?.filter((a) => a.id !== accountId).map((a) => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {txType !== "transfer" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories?.filter((c) => c.type === txType).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Note (optional)</Label>
                  <Input placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl" />
                </div>
                <Button onClick={handleCreate} className="w-full gradient-primary rounded-xl" disabled={createTx.isPending}>
                  {createTx.isPending ? "Adding..." : "Add Transaction"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />
    </div>
  );
}
