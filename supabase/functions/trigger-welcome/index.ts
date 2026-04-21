import { Inngest } from "https://esm.sh/inngest@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 🔒 Basic security — ensure it's a POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    const { userId, email, name } = await req.json();

    if (!userId || !email) {
      return new Response(JSON.stringify({ error: "Missing userId or email" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 🚀 Initialize Inngest Client with Event Key
    const eventKey = Deno.env.get("INNGEST_EVENT_KEY");
    if (!eventKey) {
       console.error("EduVest Trigger: CRITICAL - INNGEST_EVENT_KEY is missing from Supabase Secrets!");
       return new Response(JSON.stringify({ error: "Server Secret Configuration Error. Please set INNGEST_EVENT_KEY in Supabase." }), { 
         status: 500, 
         headers: { ...corsHeaders, "Content-Type": "application/json" } 
       });
    }

    const inngest = new Inngest({ 
      id: "eduvest-trigger",
      eventKey: eventKey
    });

    // 📡 Send the event to Inngest Cloud
    await inngest.send({
      name: "app/user.welcome",
      data: { userId, email, name },
    });

    console.log(`EduVest Trigger: Welcome event sent for ${email}`);

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("EduVest Trigger Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
