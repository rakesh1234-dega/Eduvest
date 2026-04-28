import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/utils/auth";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Try to fetch existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // First login: create profile with Clerk user data
        // This is what makes user info visible in Supabase dashboard
        const { data: newData, error: insertError } = await supabase
          .from("profiles")
          .insert({
            user_id:     user.id,          // Clerk user ID
            email:       user.email,       // Clerk email
            display_name: user.name,       // Clerk full name
            onboarding_completed: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      // Sync Clerk name/email on every login in case they updated it
      if (data.email !== user.email || data.display_name !== user.name) {
        const { data: updated } = await supabase
          .from("profiles")
          .update({ email: user.email, display_name: user.name })
          .eq("user_id", user.id)
          .select()
          .single();
        return updated ?? data;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      onboarding_completed?: boolean;
      display_name?: string;
      points?: number;
      level?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Upsert — handles edge case where profile wasn't created yet
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, email: user.email, display_name: user.name, ...updates },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useAddPoints() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ points, activityName }: { points: number; activityName: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Fetch current points and id
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, points, level")
        .eq("user_id", user.id)
        .single();
      
      const newPoints = (profile?.points || 0) + points;
      const newLevel = Math.floor(newPoints / 100) + 1;

      // Update profile
      await supabase
        .from("profiles")
        .update({ points: newPoints, level: newLevel })
        .eq("user_id", user.id);

      // Log activity using the profile UUID
      if (profile?.id) {
        await supabase
          .from("activity_logs")
          .insert({
            user_id: profile.id,
            activity_type: activityName,
            points_awarded: points,
          })
          .select();
      }

      return newPoints;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
