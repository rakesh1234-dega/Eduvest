import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/utils/auth";
import { toast } from "sonner";
import { notificationService } from "@/lib/notifications/notification-service";
import type { Tables, Database } from "@/integrations/supabase/types";
import {
  sendBudgetWarningEmail,
  sendBudgetExceededEmail,
  sendLowBalanceEmail,
  sendGoalAchievedEmail,
} from "@/lib/email/email-client";
import { checkAndMarkEmail } from "@/lib/email/deduplication";
import { calculateBudgetPercent, getCurrentMonthLabel, getAccountLabel, getMonthlyKey } from "@/lib/email/formatters";

export type Transaction = Tables<"transactions">;
type TxType = Database["public"]["Enums"]["transaction_type"];

export function useTransactions(filters?: { type?: TxType; accountId?: string; from?: string; to?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, filters],
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select("*, categories(name, color, icon), accounts!transactions_account_id_fkey(name, type)")
        .eq("user_id", user.id) // 🔒 Enforce identity isolation
        .order("date", { ascending: false });
      if (filters?.type) q = q.eq("type", filters.type);
      if (filters?.accountId) q = q.eq("account_id", filters.accountId);
      if (filters?.from) q = q.gte("date", filters.from);
      if (filters?.to) q = q.lte("date", filters.to);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tx: { type: TxType; amount: number; description?: string; date: string; category_id?: string; account_id: string; to_account_id?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.from("transactions").insert({ ...tx, user_id: user.id }).select().single();
      if (error) throw error;

      // Update account balances — only for accounts that belong to this user
      if (tx.type === "income") {
        const { data: acc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).eq("user_id", user.id).single();
        if (acc) await supabase.from("accounts").update({ balance: acc.balance + tx.amount }).eq("id", tx.account_id).eq("user_id", user.id);
      } else if (tx.type === "expense") {
        const { data: acc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).eq("user_id", user.id).single();
        if (acc) await supabase.from("accounts").update({ balance: acc.balance - tx.amount }).eq("id", tx.account_id).eq("user_id", user.id);
      } else if (tx.type === "transfer" && tx.to_account_id) {
        const { data: fromAcc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).eq("user_id", user.id).single();
        const { data: toAcc } = await supabase.from("accounts").select("balance").eq("id", tx.to_account_id).eq("user_id", user.id).single();
        if (fromAcc) await supabase.from("accounts").update({ balance: fromAcc.balance - tx.amount }).eq("id", tx.account_id).eq("user_id", user.id);
        if (toAcc) await supabase.from("accounts").update({ balance: toAcc.balance + tx.amount }).eq("id", tx.to_account_id).eq("user_id", user.id);
      }

      // Create basic transaction notification
      try {
        await notificationService.createNotification({
          title: "Transaction Added",
          message: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} of ₹${tx.amount.toLocaleString()} was recorded.`,
          type: "info",
          user_id: user.id,
        });

        // If it's an expense, check budget
        if (tx.type === "expense") {
          const { startOfMonth, endOfMonth, format } = await import("date-fns");
          const now = new Date();
          const start = format(startOfMonth(now), "yyyy-MM-dd");
          const end = format(endOfMonth(now), "yyyy-MM-dd");

          // Get active budget
          const { data: budgetData } = await supabase
            .from("budgets")
            .select("amount")
            .eq("user_id", user.id)
            .single();

          if (budgetData && budgetData.amount > 0) {
            // Get total expenses for the month
            const { data: expenses } = await supabase
              .from("transactions")
              .select("amount")
              .eq("user_id", user.id)
              .eq("type", "expense")
              .gte("date", start)
              .lte("date", end);

            const totalExpense = expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
            const threshold = budgetData.amount;
            const pct = calculateBudgetPercent(totalExpense, threshold);
            const remaining = threshold - totalExpense;
            const monthLabel = getCurrentMonthLabel();

            if (totalExpense > threshold) {
              await notificationService.createNotification({
                title: "Budget Exceeded",
                message: `You have exceeded your monthly budget of ₹${threshold.toLocaleString()}. Total spent: ₹${totalExpense.toLocaleString()}`,
                type: "error",
                user_id: user.id,
              });
              // Email: budget exceeded — once per month
              if (user.email && checkAndMarkEmail(user.id, "budget_exceeded", "monthly")) {
                sendBudgetExceededEmail(user.email, {
                  userName: user.name || user.email.split("@")[0],
                  totalBudget: threshold,
                  totalSpent: totalExpense,
                  exceededBy: totalExpense - threshold,
                  month: monthLabel,
                }).catch(() => {});
              }
            } else if (totalExpense >= threshold * 0.8) {
              await notificationService.createNotification({
                title: "Budget Warning",
                message: `You have used ${pct}% of your monthly budget.`,
                type: "warning",
                user_id: user.id,
              });
              // Email: budget warning — once per budget period
              if (user.email && checkAndMarkEmail(user.id, "budget_warning", "per_event")) {
                sendBudgetWarningEmail(user.email, {
                  userName: user.name || user.email.split("@")[0],
                  percentUsed: pct,
                  totalBudget: threshold,
                  totalSpent: totalExpense,
                  remaining,
                  month: monthLabel,
                }).catch(() => {});
              }
            }

            // Check low balance on the transacted account
            const LOW_BALANCE_THRESHOLD = 500;
            const { data: updatedAcc } = await supabase
              .from("accounts")
              .select("balance, name, type")
              .eq("id", tx.account_id)
              .single();
            if (
              updatedAcc &&
              updatedAcc.balance < LOW_BALANCE_THRESHOLD &&
              user.email &&
              checkAndMarkEmail(user.id, "low_balance", "per_24h", tx.account_id)
            ) {
              sendLowBalanceEmail(user.email, {
                userName: user.name || user.email.split("@")[0],
                accountName: getAccountLabel(updatedAcc.type),
                accountType: updatedAcc.type,
                currentBalance: updatedAcc.balance,
                threshold: LOW_BALANCE_THRESHOLD,
              }).catch(() => {});
            }
          }
        } else if (tx.type === "income") {
          const { startOfMonth, endOfMonth, format } = await import("date-fns");
          const now = new Date();
          const start = format(startOfMonth(now), "yyyy-MM-dd");
          const end = format(endOfMonth(now), "yyyy-MM-dd");

          // Check if there is a savings goal
          const { data: budgetData } = await supabase
            .from("budgets")
            .select("savings_goal")
            .eq("user_id", user.id)
            .single();

          if (budgetData && budgetData.savings_goal && budgetData.savings_goal > 0) {
            // Calculate net savings = income - expenses
            const { data: monthTx } = await supabase
              .from("transactions")
              .select("amount, type")
              .eq("user_id", user.id)
              .gte("date", start)
              .lte("date", end);

            const totalIn = monthTx?.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0) || 0;
            const totalOut = monthTx?.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0) || 0;
            const netSavings = totalIn - totalOut;

            if (netSavings >= budgetData.savings_goal) {
               await notificationService.createNotification({
                 title: "Goal Achieved",
                 message: `Congratulations! You've reached your savings goal of ₹${budgetData.savings_goal.toLocaleString()} for this month.`,
                 type: "success",
                 user_id: user.id,
               });
               // Email: goal achieved — once per event
               if (user.email && checkAndMarkEmail(user.id, "goal_achieved", "per_event", getMonthlyKey())) {
                 sendGoalAchievedEmail(user.email, {
                   userName: user.name || user.email.split("@")[0],
                   goalName: "Monthly Savings Goal",
                   targetAmount: budgetData.savings_goal,
                   achievedAmount: netSavings,
                   month: getCurrentMonthLabel(),
                 }).catch(() => {});
               }
            }
          }
        }
      } catch (err) {
        console.error("Failed to create notification", err);
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotifications"] });
      toast.success("Transaction added!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id); // 🔒 Enforce identity isolation
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useBulkDeleteTransactions() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", ids)
        .eq("user_id", user.id); // 🔒 Enforce identity isolation
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transactions deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
