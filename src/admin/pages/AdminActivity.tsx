import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Zap, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

const ACTIVITY_TYPES = ["all", "transaction_created", "receipt_upload", "schedule_generated"];

export default function AdminActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [a, u] = await Promise.all([
      supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("profiles").select("*"),
    ]);
    if (a.data) setActivities(a.data);
    if (u.data) setUsers(u.data);
    setLoading(false);
  };

  const filtered = activities.filter(a => {
    if (filterType !== "all" && a.activity_type !== filterType) return false;
    if (filterUser && a.user_id !== filterUser) return false;
    return true;
  });

  const totalPoints = filtered.reduce((s, a) => s + (a.points_awarded || 0), 0);

  const typeColors: Record<string, string> = {
    transaction_created: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    receipt_upload: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    schedule_generated: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">User Activity</h1><p className="text-muted-foreground text-sm mt-1">Monitor all user actions and point earnings.</p></div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-bold">{filtered.length} events</span>
          <span className="bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold">{totalPoints} pts</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[160px]">
          <option value="">All Users</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.display_name || "Unknown"}</option>)}
        </select>
        {ACTIVITY_TYPES.map(t => (
          <button key={t} onClick={() => setFilterType(t)} className={cn("px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors", filterType === t ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>{t === "all" ? "All" : t.replace(/_/g, " ")}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? <p className="p-8 text-center text-muted-foreground">Loading...</p> : filtered.length === 0 ? <p className="p-8 text-center text-muted-foreground">No activity found.</p> : (
          <div className="divide-y divide-slate-800">
            {filtered.map(a => {
              const user = users.find(u => u.id === a.user_id);
              const tc = typeColors[a.activity_type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
              return (
                <div key={a.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {user?.display_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        <span className="text-indigo-400 font-semibold">{user?.display_name || "User"}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border", tc)}>
                          <Zap className="h-3 w-3" /> {a.activity_type?.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(a.created_at), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">+{a.points_awarded} pts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
