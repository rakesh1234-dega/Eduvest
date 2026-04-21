import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, PUT, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { method } = req;
  const url = new URL(req.url);

  try {
    // 🔔 1. Fetch Notifications (GET)
    if (method === "GET") {
      const userId = url.searchParams.get("userId");
      if (!userId) return new Response("Missing userId", { status: 400, headers: corsHeaders });

      console.log(`EduVest Notify: Fetching for ${userId}`);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return new Response(JSON.stringify(data), { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 🔔 2. Create Notification (POST)
    if (method === "POST") {
      const body = await req.json();
      const { userId, title, message, type, link } = body;

      if (!userId || !title) return new Response("Missing fields", { status: 400, headers: corsHeaders });

      console.log(`EduVest Notify: Creating ${title} for ${userId}`);
      const { error } = await supabase
        .from("notifications")
        .insert([{ user_id: userId, title, message, type, link: link || null }]);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { 
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 🔔 3. Mark All as Read (PUT)
    if (method === "PUT") {
      const { userId } = await req.json();
      if (!userId) return new Response("Missing userId", { status: 400, headers: corsHeaders });

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  } catch (err: any) {
    console.error("EduVest Notify Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
