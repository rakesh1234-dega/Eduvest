import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/utils/auth";
import { toast } from "sonner";
import { format, startOfMonth } from "date-fns";
import { notificationService } from "@/lib/notifications/notification-service";
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
        .eq("user_id", user.id) // 🔒 Enforce identity isolation
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

      // Create notification
      try {
        await notificationService.createNotification({
          title: "Budget Updated",
          message: `Your budget for ${budget.month} was updated to ₹${budget.amount.toLocaleString()}.`,
          type: "info",
          user_id: user.id,
        });
      } catch (err) {
        console.error("Failed to create notification", err);
      }

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadNotifications"] });
      toast.success("Budget saved!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
