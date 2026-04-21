import { useEffect, useState } from "react";
import { Crown, Flame, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BadgeShowcase } from "@/components/Gamification/BadgeShowcase";
import { cn } from "@/utils/utils";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myBadges, setMyBadges] = useState<any[]>([]);

  useEffect(() => {
    // Fetch top users ordered by engagement points, not money
    supabase
      .from("profiles")
      .select("id, display_name, points, level, avatar_url")
      .order("points", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          // Add some mock streaks for demo
          const enriched = data.map((d, i) => ({
            ...d,
            streak: Math.max(1, 14 - i * 2), // Mock streak
          }));
          setLeaderboard(enriched);
        }
      });

    // Mock badges for the showcase
    setMyBadges([
      { name: "Starter Setup", description: "Created your first account", icon: "⭐" },
      { name: "Logging Pro", description: "Logged expense consistently", icon: "📝" },
      { name: "Budget Boss", description: "Stayed under budget", icon: "👑" },
    ]);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground font-medium tracking-tight">Ranked by engagement, consistency, and financial discipline.</p>
      </div>

      {/* Badges Showcase component */}
      <BadgeShowcase badges={myBadges} />

      {/* Top 3 Display */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].filter(Boolean).map((user, idx) => {
            // Map the layout index back to actual rank: 0 -> 2nd, 1 -> 1st, 2 -> 3rd
            const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            
            return (
              <div 
                key={user.id} 
                className={cn(
                  "rounded-3xl p-6 relative flex flex-col items-center text-center shadow-lg transform transition-transform hover:-translate-y-1",
                  rank === 1 ? "bg-gradient-to-b from-yellow-100 to-yellow-50 border border-yellow-200 md:-translate-y-4 shadow-yellow-100 z-10" :
                  rank === 2 ? "bg-gradient-to-b from-slate-100 to-slate-50 border border-border" :
                  "bg-gradient-to-b from-orange-100 to-orange-50 border border-orange-200"
                )}
              >
                <div className={cn(
                  "absolute -top-5 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-sm font-bold text-lg",
                  rank === 1 ? "bg-yellow-400 text-yellow-950" :
                  rank === 2 ? "bg-slate-300 text-foreground" :
                  "bg-orange-400 text-amber-950"
                )}>
                  #{rank}
                </div>
                
                <div className="mt-4 mb-2 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-3 shadow-inner overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="av" className="w-full h-full object-cover"/>
                    ) : (
                      <span className="text-xl font-bold text-indigo-700">{user.display_name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{user.display_name || "Anonymous"}</h3>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 justify-center mt-1">
                    <Shield className="h-4 w-4" /> Lvl {user.level || 1}
                  </p>
                </div>

                <div className="flex gap-4 mt-auto pt-4 border-t border-black/5 w-full justify-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Points</span>
                    <span className="font-bold text-foreground text-lg">{user.points || 0}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Streak</span>
                    <span className="font-bold text-foreground text-lg flex items-center gap-1">
                      {user.streak} <Flame className="h-4 w-4 text-orange-500 fill-orange-500"/>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard Table for rest */}
      <section className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400" />
        
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="py-4 px-6 text-left font-bold text-muted-foreground">Rank</th>
                <th className="py-4 px-6 text-left font-bold text-muted-foreground">User</th>
                <th className="py-4 px-6 text-center font-bold text-muted-foreground hidden sm:table-cell">Level</th>
                <th className="py-4 px-6 text-right font-bold text-muted-foreground">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, i) => (
                <tr key={user.id || i} className="border-b border-slate-50/50 hover:bg-muted transition-colors">
                  <td className="py-4 px-6">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-muted text-slate-700" :
                      i === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-card text-muted-foreground border border-border"
                    )}>
                      {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="av" className="w-full h-full object-cover"/>
                        ) : (
                          user.display_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{user.display_name || "Anonymous User"}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Flame className="h-3 w-3 text-orange-500" /> {user.streak} day streak
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center hidden sm:table-cell">
                    <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-muted text-slate-700 font-bold text-xs">
                      {user.level || 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-foreground">{user.points?.toLocaleString() || 0} pts</span>
                    </div>
                  </td>
                </tr>
              ))}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center text-muted-foreground font-medium">
                    Loading leaderboard data...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
