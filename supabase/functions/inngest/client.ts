// ─── EduVest Inngest Background Jobs ──────────────────────────────────────────
// supabase/functions/inngest/client.ts

import { Inngest } from "https://esm.sh/inngest@3";

export const inngest = new Inngest({
  id: "eduvest-app",
  // No custom event schemas needed yet since we use Cron strings
});
