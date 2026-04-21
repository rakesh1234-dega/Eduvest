import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Star, Trophy, TrendingUp } from "lucide-react";
import { cn } from "@/utils/utils";

export default function AdminReports() {
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, a] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("activity_logs").select("*"),
    ]);
    if (u.data) setUsers(u.data);
    if (a.data) setActivities(a.data);
    setLoading(false);
  };

  const totalPoints = users.reduce((s, u) => s + (u.points || 0), 0);
  const avgPoints = users.length ? Math.round(totalPoints / users.length) : 0;
  const maxLevel = users.reduce((m, u) => Math.max(m, u.level || 1), 1);

  // Activity breakdown
  const activityBreakdown: Record<string, { count: number; points: number }> = {};
  activities.forEach(a => {
    const type = a.activity_type || "unknown";
    if (!activityBreakdown[type]) activityBreakdown[type] = { count: 0, points: 0 };
    activityBreakdown[type].count++;
    activityBreakdown[type].points += a.points_awarded || 0;
  });

  // Top users by points
  const topByPoints = [...users].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10);

  // Activity by user
  const actByUser: Record<string, number> = {};
  activities.forEach(a => { actByUser[a.user_id] = (actByUser[a.user_id] || 0) + 1; });
  const topByActivity = Object.entries(actByUser)
    .map(([uid, count]) => ({ user: users.find(u => u.user_id === uid), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (loading) return <div className="py-20 text-center text-muted-foreground">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-muted-foreground text-sm mt-1">Platform analytics and insights.</p></div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "indigo" },
          { label: "Total Points Distributed", value: totalPoints.toLocaleString(), icon: Star, color: "amber" },
          { label: "Avg Points / User", value: avgPoints, icon: TrendingUp, color: "emerald" },
          { label: "Highest Level", value: `Lvl ${maxLevel}`, icon: Trophy, color: "purple" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-2xl border p-5", `bg-${s.color}-500/10 border-${s.color}-500/20`)}>
            <s.icon className={cn("h-5 w-5 mb-2", `text-${s.color}-400`)} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Breakdown */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-400" /> Activity Breakdown</h2></div>
          <div className="p-5 space-y-4">
            {Object.entries(activityBreakdown).map(([type, data]) => {
              const maxCount = Math.max(...Object.values(activityBreakdown).map(d => d.count));
              const pct = maxCount ? (data.count / maxCount) * 100 : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm text-slate-300 font-medium">{type.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">{data.count} actions • {data.points} pts</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(activityBreakdown).length === 0 && <p className="text-sm text-muted-foreground">No activity data.</p>}
          </div>
        </div>

        {/* Top Users by Points */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white flex items-center gap-2"><Trophy className="h-4 w-4 text-amber-400" /> Top Users by Points</h2></div>
          <div className="divide-y divide-slate-800">
            {topByPoints.map((u, i) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className={cn("h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold", i < 3 ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-muted-foreground")}>#{i + 1}</span>
                  <span className="text-sm font-medium text-slate-200">{u.display_name || "Unknown"}</span>
                </div>
                <span className="text-xs font-bold text-amber-400">{u.points || 0} pts</span>
              </div>
            ))}
            {topByPoints.length === 0 && <p className="p-5 text-sm text-muted-foreground">No users.</p>}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden lg:col-span-2">
          <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-400" /> Most Active Users</h2></div>
          <div className="divide-y divide-slate-800">
            {topByActivity.map(({ user, count }, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">#{i + 1}</span>
                  <span className="text-sm font-medium text-slate-200">{user?.display_name || "Unknown"}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{count} actions</span>
              </div>
            ))}
            {topByActivity.length === 0 && <p className="p-5 text-sm text-muted-foreground">No data.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
