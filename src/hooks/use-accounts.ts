import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/utils/auth";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Account = Tables<"accounts">;

export function useAccounts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Account[];
    },
    enabled: !!user,
  });
}

export function useCreateAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (account: { name: string; type: Account["type"]; balance: number; is_default?: boolean; description?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      // If setting as default, unset existing defaults
      if (account.is_default) {
        await supabase.from("accounts").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
      }
      
      const { data, error } = await supabase.from("accounts").insert({
        ...account,
        user_id: user.id,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account created!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateAccount() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Account> & { id: string }) => {
      if (!user) throw new Error("Not authenticated");
      if (updates.is_default) {
        await supabase.from("accounts").update({ is_default: false }).eq("user_id", user.id).eq("is_default", true);
      }
      const { data, error } = await supabase.from("accounts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account updated!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
