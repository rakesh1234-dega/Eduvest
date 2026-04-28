import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star, MessageSquare, Zap, Activity, TrendingUp, ArrowUpRight, Eye } from "lucide-react";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, a, m] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(10),
    ]);
    if (u.data) setUsers(u.data);
    if (a.data) setActivities(a.data);
    if (m.data) setMessages(m.data);
    setLoading(false);
  };

  const totalPoints = users.reduce((s, u) => s + (u.points || 0), 0);
  const todayActivityCount = activities.filter(a => {
    const d = new Date(a.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const topUsers = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);

  const stats = [
    { label: "Total Users",      value: users.length,        icon: Users,          color: "indigo" },
    { label: "Total Points",     value: totalPoints,         icon: Star,           color: "amber" },
    { label: "Messages Sent",    value: messages.length,     icon: MessageSquare,  color: "blue" },
    { label: "Activities Today", value: todayActivityCount,  icon: Activity,       color: "emerald" },
  ];

  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    indigo:  { bg: "bg-indigo-500/10", icon: "text-indigo-400", border: "border-indigo-500/20" },
    amber:   { bg: "bg-amber-500/10",  icon: "text-amber-400",  border: "border-amber-500/20" },
    blue:    { bg: "bg-blue-500/10",   icon: "text-blue-400",   border: "border-blue-500/20" },
    emerald: { bg: "bg-emerald-500/10",icon: "text-emerald-400",border: "border-emerald-500/20" },
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, Admin. Here's your platform overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const c = colorMap[s.color];
          return (
            <div key={s.label} className={cn("rounded-2xl border p-5 transition-colors", c.border, c.bg)}>
              <div className="flex items-center justify-between mb-3">
                <s.icon className={cn("h-5 w-5", c.icon)} />
                <ArrowUpRight className={cn("h-4 w-4", c.icon, "opacity-50")} />
              </div>
              <p className="text-2xl font-bold text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2"><Activity className="h-4 w-4 text-indigo-400" /> Recent Activity</h2>
            <button onClick={() => navigate("/admin/activity")} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View All →</button>
          </div>
          <div className="divide-y divide-slate-800">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">No activity recorded yet.</p>
            ) : activities.slice(0, 6).map((a) => {
              const user = users.find(u => u.id === a.user_id);
              return (
                <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                      {user?.display_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        <span className="text-indigo-400">{user?.display_name || "User"}</span> — {a.activity_type?.replace(/_/g, " ")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(a.created_at), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">+{a.points_awarded} pts</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Engaged Users */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-bold text-white flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-400" /> Top Users</h2>
            <button onClick={() => navigate("/admin/users")} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View All →</button>
          </div>
          <div className="divide-y divide-slate-800">
            {topUsers.map((u, i) => (
              <div key={u.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold",
                    i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-slate-400/20 text-slate-300" : "bg-orange-500/10 text-orange-400"
                  )}>
                    #{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{u.display_name || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground">Level {u.level || 1}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                  <Star className="h-3 w-3" /> {u.points || 0}
                </span>
              </div>
            ))}
            {topUsers.length === 0 && <p className="text-sm text-muted-foreground p-5">No users yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Send Message", desc: "Direct message to a user", path: "/admin/messages", color: "from-indigo-600 to-blue-600" },
          { label: "New Announcement", desc: "Broadcast to all users", path: "/admin/announcements", color: "from-purple-600 to-pink-600" },
          { label: "View Reports", desc: "Platform analytics", path: "/admin/reports", color: "from-emerald-600 to-teal-600" },
        ].map(q => (
          <button
            key={q.label}
            onClick={() => navigate(q.path)}
            className={cn("bg-gradient-to-r text-white rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform shadow-lg", q.color)}
          >
            <p className="font-bold text-lg">{q.label}</p>
            <p className="text-white/60 text-sm mt-1">{q.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
