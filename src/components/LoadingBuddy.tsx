import { GraduationCap } from "lucide-react";

/**
 * LoadingBuddy
 * A premium, branded loading component for EduVest / BudgetBuddy.
 * Features a smooth pulse animation and a high-end gradient.
 */
export function LoadingBuddy() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full gap-4 transition-all animate-in fade-in duration-700">
      <div className="relative">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-3xl gradient-primary blur-xl opacity-20 animate-pulse scale-110" />
        
        {/* Central Icon Container */}
        <div className="relative h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center shadow-2xl animate-bounce-slow">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground/90">
          EduVest
        </h3>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Securing your finances...
        </p>
      </div>

      {/* Modern thin progress bar */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mt-2">
        <div className="h-full gradient-primary w-1/3 animate-progress-indeterminate rounded-full" />
      </div>
    </div>
  );
}

// Add these to your tailwind config or a global CSS file if not already there:
// @keyframes progress-indeterminate {
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(300%); }
// }
