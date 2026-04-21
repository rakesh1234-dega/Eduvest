import { Trophy, Star, Target } from "lucide-react";
import { cn } from "@/utils/utils";

interface LevelProgressProps {
  level: number;
  points: number;
  className?: string;
}

export function LevelProgress({ level, points, className }: LevelProgressProps) {
  // Simple SDT gamification formula: level * 100 is next threshold
  const threshold = level * 100;
  const prevThreshold = (level - 1) * 100;
  const pointsInLevel = points - prevThreshold;
  const requiredInLevel = threshold - prevThreshold;
  const progressPercent = Math.min(100, Math.max(0, (pointsInLevel / requiredInLevel) * 100));

  return (
    <div className={cn("bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden", className)}>
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-2 border-white/30 backdrop-blur-sm">
            <Trophy className="h-6 w-6 text-yellow-300" />
            <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-yellow-400 text-yellow-950 font-bold text-xs flex items-center justify-center shadow-sm">
              {level}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Financial Scholar Level {level}</h3>
            <p className="text-indigo-200 text-sm font-medium">{points} total points earned</p>
          </div>
        </div>
        
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5 text-yellow-300 font-bold mb-1">
            <Star className="h-4 w-4 fill-current" />
            <span>{threshold - points} pts to level up</span>
          </div>
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1.5 text-xs font-medium text-indigo-200">
          <span>Lvl {level}</span>
          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Lvl {level + 1}</span>
        </div>
      </div>
    </div>
  );
}
