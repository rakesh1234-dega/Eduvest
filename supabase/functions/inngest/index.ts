// ─── EduVest Inngest Background Jobs ──────────────────────────────────────────
// supabase/functions/inngest/index.ts

import { serve } from "https://esm.sh/inngest@3/edge";
import { inngest } from "./client.ts";
import { cronDailySummary, cronMonthlySummary, cronInactivityReminder, handleWelcomeEmail } from "./functions.ts";

const handler = serve({
  client: inngest,
  functions: [
    cronDailySummary,
    cronMonthlySummary,
    cronInactivityReminder,
    handleWelcomeEmail,
  ],
  servePath: "/functions/v1/inngest",
});

Deno.serve((req) => handler(req));
