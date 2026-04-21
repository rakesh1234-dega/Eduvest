import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Send, Clock, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-slate-500/10 text-slate-400" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-400" },
  { value: "high", label: "High", color: "bg-rose-500/10 text-rose-400" },
];

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("low");
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [a, u] = await Promise.all([
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, display_name"),
    ]);
    if (a.data) setAnnouncements(a.data);
    if (u.data) setUsers(u.data);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) { toast.error("Fill in title and message"); return; }
    setSending(true);
    try {
      // Save announcement
      await supabase.from("announcements").insert({ title, body, priority });

      // Also send as message to each user
      const inserts = users.map(u => ({
        sender_id: null,
        recipient_id: u.id,
        subject: `📢 ${title}`,
        body: body,
      }));
      if (inserts.length > 0) {
        await supabase.from("messages").insert(inserts);
      }

      toast.success(`Announcement broadcast to ${users.length} users!`);
      setTitle(""); setBody(""); setPriority("low");
      loadData();
    } catch { toast.error("Failed to send"); }
    setSending(false);
  };

  const priorityIcon = (p: string) => {
    if (p === "high") return <AlertCircle className="h-3.5 w-3.5" />;
    if (p === "medium") return <AlertTriangle className="h-3.5 w-3.5" />;
    return <Info className="h-3.5 w-3.5" />;
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Announcements</h1><p className="text-muted-foreground text-sm mt-1">Broadcast messages to all users at once.</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-purple-600/10"><h2 className="font-bold text-purple-300 flex items-center gap-2"><Megaphone className="h-4 w-4" /> New Announcement</h2></div>
          <form onSubmit={handleSend} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement..." rows={5} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)} className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border", priority === p.value ? `${p.color} border-current` : "bg-slate-800 text-muted-foreground border-slate-700 hover:bg-slate-700")}>{p.label}</button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={sending} className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Megaphone className="h-4 w-4" /> Broadcast to {users.length} Users</>}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white">Previous Announcements</h2></div>
          <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto">
            {announcements.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No announcements yet.</p> : announcements.map(a => {
              const pc = PRIORITIES.find(p => p.value === a.priority);
              return (
                <div key={a.id} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-200">{a.title}</p>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md", pc?.color)}>{priorityIcon(a.priority)} {a.priority}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{a.body}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(a.created_at), "MMM d, h:mm a")}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
