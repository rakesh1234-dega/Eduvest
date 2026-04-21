// ─── EduVest Email Notification System ───────────────────────────────────────
// supabase/functions/send-email/index.ts
// Deno-based Supabase Edge Function — runs server-side, calls Resend securely
//
// Deploy with: supabase functions deploy send-email
// Set secret:  supabase secrets set RESEND_API_KEY=re_...

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { buildEmailTemplate } from "./templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── Read Resend API key from Supabase secrets ──────────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[EduVest Email] RESEND_API_KEY is not set in Supabase secrets.");
      return new Response(
        JSON.stringify({ error: "Email service not configured. Set RESEND_API_KEY." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse request body ─────────────────────────────────────────────────
    const body = await req.json();
    const { emailType, to, data } = body;

    if (!emailType || !to || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: emailType, to, data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email
    if (!to.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build email content ────────────────────────────────────────────────
    const { subject, html } = buildEmailTemplate(emailType, data);

    // ── Call Resend API ────────────────────────────────────────────────────
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "EduVest <onboarding@resend.dev>";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[EduVest Email] Resend API error:", JSON.stringify(resendResult));
      return new Response(
        JSON.stringify({ error: resendResult.message ?? "Email delivery failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.info(`[EduVest Email] ✓ Delivered ${emailType} to ${to} — ID: ${resendResult.id}`);

    return new Response(
      JSON.stringify({ success: true, id: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[EduVest Email] Unhandled error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
