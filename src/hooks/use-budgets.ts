import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

export type Budget = Tables<"budgets">;

export function useCurrentBudget() {
  const { user } = useAuth();
  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
  return useQuery({
    queryKey: ["budget", user?.id, currentMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", currentMonth)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpsertBudget() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (budget: { amount: number; month: string; alert_threshold?: number; savings_goal?: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("budgets").upsert(
        { ...budget, user_id: user.id },
        { onConflict: "user_id,month" }
      ).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
      toast.success("Budget saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
