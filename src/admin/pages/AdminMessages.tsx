import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "../AdminAuthContext";
import { Send, MessageSquare, Clock, CheckCircle2, Mail, Bell, Loader2, XCircle, Key } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { sendDirectEmail, getResendApiKey, setResendApiKey } from "@/lib/email/direct-sender";
import type { EmailType } from "@/lib/email/types";

type TestStatus = "idle" | "sending" | "success" | "error";

const EMAIL_TESTS: { type: EmailType; label: string; icon: string; desc: string }[] = [
  { type: "welcome",         label: "Welcome Email",        icon: "🚀", desc: "Sent after onboarding" },
  { type: "budget_warning",  label: "Budget Warning",       icon: "⚠️", desc: "At 80% budget usage" },
  { type: "budget_exceeded", label: "Budget Exceeded",      icon: "🚨", desc: "When over monthly budget" },
  { type: "daily_summary",   label: "Daily Summary",        icon: "📊", desc: "Daily spending digest" },
  { type: "low_balance",     label: "Low Balance Alert",    icon: "⚡", desc: "When account is low" },
  { type: "goal_achieved",   label: "Goal Achieved",        icon: "🎉", desc: "Savings target reached" },
  { type: "monthly_summary", label: "Monthly Summary",      icon: "📅", desc: "Month-end report" },
  { type: "reminder",        label: "Finance Reminder",     icon: "💬", desc: "Inactivity nudge" },
];

export default function AdminMessages() {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [emailTarget, setEmailTarget] = useState("");
  const [apiKey, setApiKey] = useState(getResendApiKey() || "");
  const [apiKeySaved, setApiKeySaved] = useState(!!getResendApiKey());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [u, m] = await Promise.all([
      supabase.from("profiles").select("*").order("display_name"),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    if (u.data) setUsers(u.data);
    if (m.data) setMessages(m.data);
  };

  const handleSaveApiKey = () => {
    if (!apiKey.startsWith("re_")) {
      toast.error("Invalid API key — must start with 're_'");
      return;
    }
    setResendApiKey(apiKey);
    setApiKeySaved(true);
    toast.success("Resend API key saved!");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !body) { toast.error("Fill all fields"); return; }
    setSending(true);
    try {
      await supabase.from("messages").insert({
        sender_id: null,
        recipient_id: recipient,
        subject: subject,
        body: body,
      });
      await supabase.from("notifications").insert({
        user_id: recipient,
        title: "New Message from Admin",
        message: subject,
        type: "info",
        link: "/inbox",
      });
      if (sendEmail) {
        const target = users.find(u => u.id === recipient);
        if (target?.email && apiKeySaved) {
          const result = await sendDirectEmail("reminder", target.email, target.display_name);
          if (result.success) {
            toast.success(`📧 Email sent to ${target.email}`);
          } else {
            toast.error(`Email failed: ${result.error}`);
          }
        }
      }
      toast.success("Message sent to user's Inbox!");
      setSubject(""); setBody(""); setSendEmail(false);
      loadData();
    } catch { toast.error("Failed to send"); }
    setSending(false);
  };

  const handleTestEmail = async (emailType: EmailType) => {
    const targetUser = users.find(u => u.id === emailTarget);
    if (!targetUser?.email) {
      toast.error("Select a user first to send test email.");
      return;
    }
    if (!apiKeySaved) {
      toast.error("Enter and save your Resend API key first.");
      return;
    }
    setTestStatuses(prev => ({ ...prev, [emailType]: "sending" }));
    try {
      const result = await sendDirectEmail(emailType, targetUser.email, targetUser.display_name);
      if (result.success) {
        setTestStatuses(prev => ({ ...prev, [emailType]: "success" }));
        toast.success(`Email sent to ${targetUser.email}!`);
      } else {
        setTestStatuses(prev => ({ ...prev, [emailType]: "error" }));
        toast.error(`Failed: ${result.error}`);
      }
    } catch {
      setTestStatuses(prev => ({ ...prev, [emailType]: "error" }));
      toast.error("Failed to send test email.");
    }
    setTimeout(() => {
      setTestStatuses(prev => ({ ...prev, [emailType]: "idle" }));
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Messages & Email</h1><p className="text-muted-foreground text-sm mt-1">Send messages to users' Inbox and send email notifications.</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Composer */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-indigo-600/10"><h2 className="font-bold text-indigo-300 flex items-center gap-2"><Send className="h-4 w-4" /> Compose Message</h2></div>
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Recipient</label>
              <select value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                <option value="">Select user...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.display_name || "Unknown"} ({u.email || u.id.slice(0,8)})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none" />
            </div>
            <label className="flex items-center gap-2.5 bg-slate-800 rounded-xl px-4 py-3 border border-slate-700 cursor-pointer">
              <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="h-4 w-4 rounded border-slate-600 text-indigo-600" />
              <span className="text-sm text-slate-300 font-medium"><Mail className="h-3.5 w-3.5 inline mr-1" />Also send as Email</span>
            </label>
            <button type="submit" disabled={sending} className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="h-4 w-4" /> Send Message</>}
            </button>
          </form>
        </div>

        {/* Message History */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white flex items-center gap-2"><MessageSquare className="h-4 w-4 text-indigo-400" /> Sent Messages</h2></div>
          <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No messages sent yet.</p> : messages.map(m => {
              const target = users.find(u => u.id === m.recipient_id);
              return (
                <div key={m.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-200">{m.subject}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", m.is_read ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400")}>{m.is_read ? "Read" : "Unread"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{m.body}</p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>To: {target?.display_name || "User"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(m.created_at), "MMM d, h:mm a")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── API Key Setup ── */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-emerald-600/10 flex items-center justify-between">
          <h2 className="font-bold text-emerald-300 flex items-center gap-2">
            <Key className="h-4 w-4" /> Resend API Key
          </h2>
          {apiKeySaved && (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-md">
              ✓ Configured
            </span>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs text-muted-foreground mb-3">
            Enter your Resend API key to enable direct email sending. Get one free at{" "}
            <a href="https://resend.com" target="_blank" rel="noopener" className="text-indigo-400 underline">resend.com</a>.
            Key is stored locally in your browser only.
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setApiKeySaved(false); }}
              placeholder="re_xxxxxxxxxxxxxxxx"
              className="flex-1 h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono"
            />
            <button
              onClick={handleSaveApiKey}
              className="h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>

      {/* ── Email Notifications Panel (Admin Only) ── */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-violet-600/10 flex items-center justify-between">
          <h2 className="font-bold text-violet-300 flex items-center gap-2">
            <Bell className="h-4 w-4" /> Email Notifications
          </h2>
          <span className="text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">
            Admin Only
          </span>
        </div>
        <div className="p-5 space-y-5">
          <p className="text-xs text-muted-foreground">
            Send professional email notifications to users. Select a user below, then click "Test" to send directly via Resend API.
          </p>
          
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Send To User</label>
            <select 
              value={emailTarget} 
              onChange={e => setEmailTarget(e.target.value)} 
              className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="">Select user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.display_name || "Unknown"} ({u.email || u.id.slice(0,8)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EMAIL_TESTS.map(({ type, label, icon, desc }) => {
              const status = testStatuses[type] ?? "idle";
              return (
                <div
                  key={type}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTestEmail(type)}
                    disabled={status === "sending" || !emailTarget || !apiKeySaved}
                    className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                      bg-slate-700 border-slate-600 hover:border-violet-500 hover:text-violet-300 text-slate-400"
                    title={!apiKeySaved ? "Save API key first" : !emailTarget ? "Select a user first" : `Send test ${label}`}
                  >
                    {status === "sending" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {status === "success" && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                    {status === "error" && <XCircle className="h-3 w-3 text-rose-400" />}
                    {status === "idle" && <Send className="h-3 w-3" />}
                    {status === "sending" ? "Sending…" : status === "success" ? "Sent!" : status === "error" ? "Failed" : "Test"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <p className="text-xs text-violet-300 font-medium">
              ℹ️ <strong>Resend Free Tier Notice:</strong> Until you verify a custom domain in Resend, you can <strong>only successfully send emails to your own email address</strong>. Sending to other users will fail with a "Forbidden" error.
            </p>
          </div>

          {!apiKeySaved && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-300 font-medium">
                ⚠️ <strong>Setup required:</strong> Enter your Resend API key above to enable email sending.
                Get a free key at <a href="https://resend.com" target="_blank" rel="noopener" className="underline">resend.com</a>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
