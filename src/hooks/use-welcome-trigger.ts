import { useEffect } from "react";
import { useAuth } from "@/utils/auth";
import { supabase } from "@/integrations/supabase/client";

/**
 * useWelcomeTrigger
 * Automatically sends an 'app/user.welcome' event to the Inngest server
 * when a user is logged in. The server handles deduplication (sending only once).
 */
export function useWelcomeTrigger() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const triggerWelcomeEmail = async () => {
      try {
        // 🔒 We call our new Proxy function instead of Inngest directly using invoke
        // which automatically appends your authorization tokens so it doesn't get a 401
        const { data, error } = await supabase.functions.invoke("trigger-welcome", {
          body: {
            userId: user.id,
            email: user.email,
            name: user.name,
          }
        });

        if (error) {
          console.warn("EduVest: Welcome edge function unavailable or unconfigured. (Harmless)", error.message);
          return;
        }

        if (data?.success) {
           console.log("EduVest: ✅ Welcome event successfully triggered for", user.email);
        } else {
           console.warn("EduVest: ⚠️ Welcome trigger skipped or already sent", data);
        }
      } catch (err: any) {
        console.warn("EduVest: Failed to trigger welcome event (Harmless if Edge Functions are not deployed)", err.message || err);
      }
    };

    triggerWelcomeEmail();
  }, [user?.id]);
}
