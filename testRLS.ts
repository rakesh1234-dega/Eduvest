import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://fdsnycmyyvplgeohterr.supabase.co";
const SUPABASE_KEY = "sb_publishable_G2_fIUVzyfWi13_VBZh8Hg_0V3uwPQv";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRLS() {
  console.log("Fetching profiles...");
  const { data: users, error: userError } = await supabase.from("profiles").select("*").limit(5);
  console.log("Profiles result:", users?.length, userError);

  if (!users || users.length === 0) return;

  const sampleAdmin = users.find(u => u.role === "admin") || users[0];
  const sampleUser = users.find(u => u.id !== sampleAdmin.id) || users[0];

  console.log(`Admin: ${sampleAdmin.id}, User: ${sampleUser.id}`);

  console.log("Testing insert into messages...");
  const { data: msgRes, error: msgErr } = await supabase.from("messages").insert({
    sender_id: sampleAdmin.id,
    recipient_id: sampleUser.id,
    subject: "Test Subject",
    body: "Test Body"
  }).select();
  console.log("Message Insert Error:", JSON.stringify(msgErr));
  console.log("Message Insert Result:", msgRes);

  console.log("Testing insert into notifications...");
  const { data: notifRes, error: notifErr } = await supabase.from("notifications").insert({
    user_id: sampleUser.user_id,
    title: "Test Title",
    message: "Test Body",
    type: "message",
    is_read: false
  }).select();
  console.log("Notification Insert Error:", JSON.stringify(notifErr));
  console.log("Notification Insert Result:", notifRes);
}

testRLS().catch(console.error);
