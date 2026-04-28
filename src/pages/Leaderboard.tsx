import { useEffect, useState } from "react";
import { Crown, Flame, Shield, Trophy, Zap, ChevronRight, CheckCircle2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BadgeShowcase, BadgeDef } from "@/components/Gamification/BadgeShowcase";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/utils/utils";

// Comprehensive Dictionary defining ALL project badges explicitly
const ALL_BADGES: Omit<BadgeDef, "isUnlocked">[] = [
  { id: "b1", name: "Starter Setup", description: "Created your first account", icon: "⭐", unlockCondition: "Complete the initial onboarding step" },
  { id: "b2", name: "Logging Pro", description: "Logged expense consistently", icon: "📝", unlockCondition: "Log 5 expenses within a single week" },
  { id: "b3", name: "Budget Boss", description: "Stayed under budget", icon: "👑", unlockCondition: "Finish a full month without exceeding budget limits" },
  { id: "b4", name: "Streak Master", description: "Maintained perfect schedule", icon: "🔥", unlockCondition: "Achieve a 7-day Perfect Schedule completion streak" },
  { id: "b5", name: "Savings Guru", description: "Met savings goal", icon: "🎯", unlockCondition: "Hit your defined savings goal mapping for 2 consecutive months" }
];

export default function LeaderboardPage() {
  const { data: profile } = useProfile();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [myBadges, setMyBadges] = useState<BadgeDef[]>([]);

  useEffect(() => {
    // Top users
    supabase
      .from("profiles")
      .select("id, display_name, points, level, avatar_url")
      .order("points", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) {
          const enriched = data.map((d, i) => ({
            ...d,
            streak: Math.max(1, 14 - i * 2), // Mock streak for demo
          }));
          setLeaderboard(enriched);
        }
      });
  }, []);

  useEffect(() => {
    if (profile) {
      const computedBadges = ALL_BADGES.map((b, index) => ({
        ...b,
        isUnlocked: index < 2 // For demo purposes, we unlock the first 2 automatically representing their actual progression
      }));
      setMyBadges(computedBadges);
    }
  }, [profile]);

  // Specific user leveling calcs
  const currentLevel = profile?.level || 1;
  const currentPoints = profile?.points || 0;
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsNeededForNext = currentLevel * 100;
  const progressPercent = Math.min(100, Math.max(0, ((currentPoints - pointsForCurrentLevel) / 100) * 100));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-6xl mx-auto">
      
      {/* 1. PERSONAL PROGRESSION HERO CARD (Light Logo Glowing Feature) */}
      <div className="relative bg-card border border-indigo-200/40 dark:border-indigo-800/40 rounded-[2.5rem] p-6 sm:p-10 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-8">
        
        {/* Glow effect matching 'light logo' requesting */}
        <div className="absolute top-1/2 left-[15%] w-[400px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 animate-pulse" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-[120px] -translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col items-center justify-center shrink-0">
          <div className="relative group cursor-default">
            {/* The Light Logo itself */}
            <div className="absolute inset-0 bg-indigo-400 dark:bg-indigo-500 rounded-full blur-[30px] opacity-60 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
            
            <div className="h-32 w-32 rounded-full border-[5px] border-indigo-200 dark:border-indigo-900 bg-gradient-to-b from-indigo-500 to-violet-700 flex flex-col items-center justify-center relative z-10 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
               {/* Internal gleam */}
               <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 dark:bg-white/10" />
               <Shield className="h-8 w-8 text-indigo-100 mb-1" />
               <span className="text-4xl font-black text-white leading-none tracking-tighter">{currentLevel}</span>
            </div>
            
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-bold px-3 py-1 rounded-full text-xs shadow-xl border-2 border-white dark:border-slate-900 flex items-center gap-1 z-20">
              <Flame className="h-3 w-3 fill-white" /> 2 Day
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 w-full text-center md:text-left pt-4 md:pt-0">
          <h2 className="text-3xl font-black text-foreground mb-1.5 tracking-tight">Level {currentLevel} Adventurer</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-lg mx-auto md:mx-0 font-medium">
            Keep completing daily routine tasks and checking off your budget goals to earn points and unlock real project features!
          </p>

          <div className="space-y-2.5">
            <div className="flex justify-between text-sm font-bold text-foreground px-1">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                 <Zap className="h-4 w-4" /> {currentPoints} XP
              </span>
              <span className="text-muted-foreground">{pointsNeededForNext} XP for Lvl {currentLevel + 1}</span>
            </div>
            <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
               <div 
                 className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-full transition-all duration-1000 ease-out relative"
                 style={{ width: `${progressPercent}%` }}
               >
                 <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXPLICIT BADGES SHOWCASE */}
      <BadgeShowcase badges={myBadges} />

      {/* 3. FUTURE PERKS ROADMAP */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Level-Up Feature Roadmap</h2>
        </div>
        <div className="bg-card border border-border shadow-sm rounded-[2rem] p-6 lg:p-8">
          <p className="text-sm font-medium text-muted-foreground mb-6">Reaching higher levels explicitly unlocks real project features! Keep engaging to unlock the future of EduVest.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className={cn("relative border p-6 rounded-3xl transition-all duration-300", currentLevel >= 3 ? "border-amber-500/30 bg-amber-500/5 shadow-sm" : "border-border bg-muted/30 opacity-70")}>
               <div className="flex items-center gap-2 mb-3">
                 <span className={cn("text-white font-bold text-xs px-2.5 py-1 rounded-full", currentLevel >= 3 ? "bg-amber-500" : "bg-slate-400")}>Level 3</span>
                 <h4 className="font-bold text-sm text-foreground">Premium Themes</h4>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">Unlock custom color palettes and a true OLED dark mode layout for the entire dashboard.</p>
               {currentLevel >= 3 ? <CheckCircle2 className="absolute top-5 right-5 h-5 w-5 text-emerald-500 animate-in zoom-in" /> : <Lock className="absolute top-5 right-5 h-4 w-4 text-slate-400" />}
            </div>

            <div className={cn("relative border p-6 rounded-3xl transition-all duration-300", currentLevel >= 5 ? "border-indigo-500/30 bg-indigo-500/5 shadow-sm" : "border-border bg-muted/30 opacity-70")}>
               <div className="flex items-center gap-2 mb-3">
                 <span className={cn("text-white font-bold text-xs px-2.5 py-1 rounded-full", currentLevel >= 5 ? "bg-indigo-500" : "bg-slate-400")}>Level 5</span>
                 <h4 className="font-bold text-sm text-foreground">Advanced AI Analyst</h4>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">Gain direct access to advanced AI chat personalities tailored for deeper investment planning.</p>
               {currentLevel >= 5 ? <CheckCircle2 className="absolute top-5 right-5 h-5 w-5 text-emerald-500 animate-in zoom-in" /> : <Lock className="absolute top-5 right-5 h-4 w-4 text-slate-400" />}
            </div>

            <div className={cn("relative border p-6 rounded-3xl transition-all duration-300", currentLevel >= 10 ? "border-rose-500/30 bg-rose-500/5 shadow-sm" : "border-border bg-muted/30 opacity-70")}>
               <div className="flex items-center gap-2 mb-3">
                 <span className={cn("text-white font-bold text-xs px-2.5 py-1 rounded-full", currentLevel >= 10 ? "bg-rose-500" : "bg-slate-400")}>Level 10</span>
                 <h4 className="font-bold text-sm text-foreground">Pro Portfolio API</h4>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">Unlock active stock API integrations allowing you to track real investments directly within the Budget Hub.</p>
               {currentLevel >= 10 ? <CheckCircle2 className="absolute top-5 right-5 h-5 w-5 text-emerald-500 animate-in zoom-in" /> : <Lock className="absolute top-5 right-5 h-4 w-4 text-slate-400" />}
            </div>

          </div>
        </div>
      </section>

      {/* 4. LEADERBOARD TOP RANKINGS */}
      <section className="bg-card rounded-[2rem] border border-border/60 shadow-sm pt-8 px-2 lg:px-8 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400" />
        
        <div className="px-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Global Rankings</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Challenge top players ranked by engagement and consistency.</p>
        </div>

        <div className="overflow-x-auto mt-2 -mx-2 px-2">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="py-4 px-6 text-left font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Rank</th>
                <th className="py-4 px-6 text-left font-bold text-muted-foreground uppercase tracking-wider text-[11px]">User Profile</th>
                <th className="py-4 px-6 text-center font-bold text-muted-foreground hidden sm:table-cell uppercase tracking-wider text-[11px]">Level</th>
                <th className="py-4 px-6 text-right font-bold text-muted-foreground uppercase tracking-wider text-[11px]">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, i) => (
                <tr key={user.id || i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                      i === 0 ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                      i === 1 ? "bg-slate-200 text-slate-700 border border-slate-300" :
                      i === 2 ? "bg-orange-100 text-orange-700 border border-orange-200" :
                      "bg-card text-muted-foreground border border-border"
                    )}>
                      {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border border-border rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shadow-sm">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="av" className="w-full h-full object-cover"/>
                        ) : (
                          user.display_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{user.display_name || "Anonymous User"}</span>
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500" /> {user.streak} day streak
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center hidden sm:table-cell">
                    <span className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-bold text-xs border border-indigo-100 dark:border-indigo-800">
                      Lvl {user.level || 1}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-foreground text-[15px]">{user.points?.toLocaleString() || 0}</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">XP</span>
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
