import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import type { Tables, Database } from "@/integrations/supabase/types";

export type Transaction = Tables<"transactions">;
type TxType = Database["public"]["Enums"]["transaction_type"];

export function useTransactions(filters?: { type?: TxType; accountId?: string; from?: string; to?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["transactions", user?.id, filters],
    queryFn: async () => {
      let q = supabase.from("transactions").select("*, categories(name, color, icon), accounts!transactions_account_id_fkey(name, type)").order("date", { ascending: false });
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

      // Update account balances
      if (tx.type === "income") {
        const { data: acc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).single();
        if (acc) await supabase.from("accounts").update({ balance: acc.balance + tx.amount }).eq("id", tx.account_id);
      } else if (tx.type === "expense") {
        const { data: acc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).single();
        if (acc) await supabase.from("accounts").update({ balance: acc.balance - tx.amount }).eq("id", tx.account_id);
      } else if (tx.type === "transfer" && tx.to_account_id) {
        const { data: fromAcc } = await supabase.from("accounts").select("balance").eq("id", tx.account_id).single();
        const { data: toAcc } = await supabase.from("accounts").select("balance").eq("id", tx.to_account_id).single();
        if (fromAcc) await supabase.from("accounts").update({ balance: fromAcc.balance - tx.amount }).eq("id", tx.account_id);
        if (toAcc) await supabase.from("accounts").update({ balance: toAcc.balance + tx.amount }).eq("id", tx.to_account_id);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction added!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("transactions").delete().in("id", ids);
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
