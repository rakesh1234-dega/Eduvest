import { Medal, Trophy, Star, ShieldCheck, Crown } from "lucide-react";
import { cn } from "@/utils/utils";

const ICONS: Record<string, any> = {
  "⭐": Star,
  "📝": ShieldCheck,
  "👑": Crown,
  "🎓": Trophy,
};

interface Badge {
  name: string;
  description: string;
  icon: string;
}

interface BadgeShowcaseProps {
  badges: Badge[];
}

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Medal className="h-5 w-5 text-indigo-500" />
        <h2 className="text-xl font-bold text-foreground">Your Badges</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b, i) => {
          const Icon = ICONS[b.icon] || Trophy;
          return (
            <div 
              key={i} 
              className="group relative bg-card border border-border shadow-sm hover:shadow-md p-5 rounded-3xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              {/* Premium gradient background overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-7 w-7 text-indigo-600 drop-shadow-sm" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">{b.name}</h3>
                <p className="text-xs text-muted-foreground font-medium">{b.description}</p>
              </div>
            </div>
          );
        })}
        {/* Empty spot for locked badge */}
        <div className="bg-muted border border-border border-dashed shadow-sm p-5 rounded-3xl flex flex-col items-center justify-center opacity-70">
          <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center mb-3">
            <span className="text-muted-foreground font-bold text-lg">?</span>
          </div>
          <h3 className="font-bold text-sm text-muted-foreground mb-1">Locked Badge</h3>
          <p className="text-[10px] text-slate-400 font-medium">Keep saving to unlock!</p>
        </div>
      </div>
    </section>
  );
}
