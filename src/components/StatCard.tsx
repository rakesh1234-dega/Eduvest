import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; positive: boolean };
  iconBg?: string;
  iconColor?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  title, value, icon: Icon, description, trend, iconBg, iconColor, accent, className
}: StatCardProps) {
  return (
    <div className={cn(
      "rounded-2xl p-5 bg-card border border-border card-hover",
      accent && "gradient-primary text-white border-0 shadow-lg",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            accent ? "text-white/70" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold mt-2 tracking-tight",
            accent ? "text-white" : "text-foreground"
          )}>
            {value}
          </p>
          {trend && (
            <p className={cn(
              "text-xs mt-1.5 font-medium flex items-center gap-1",
              accent ? "text-white/80" : trend.positive ? "text-emerald-600" : "text-rose-500"
            )}>
              <span>{trend.positive ? "▲" : "▼"}</span>
              <span>{trend.value}</span>
            </p>
          )}
          {description && !trend && (
            <p className={cn("text-xs mt-1", accent ? "text-white/70" : "text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>
        <div className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ml-3",
          accent ? "bg-white/20" : iconBg ?? "bg-accent"
        )}>
          <Icon className={cn("h-5 w-5", accent ? "text-white" : iconColor ?? "text-accent-foreground")} />
        </div>
      </div>
    </div>
  );
}
