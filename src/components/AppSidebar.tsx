import {
  LayoutDashboard, Wallet, ArrowLeftRight, PiggyBank, BarChart3,
  GraduationCap, ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/utils";

const navItems = [
  { title: "Dashboard",        url: "/dashboard",         icon: LayoutDashboard },
  { title: "Enter Application",url: "/enter-application", icon: ClipboardList  },
  { title: "Accounts",         url: "/accounts",          icon: Wallet         },
  { title: "Transactions",     url: "/transactions",      icon: ArrowLeftRight  },
  { title: "Budget",           url: "/budget",            icon: PiggyBank      },
  { title: "Analytics",        url: "/analytics",         icon: BarChart3      },
];

export function AppSidebar() {
  const location = useLocation();

  const isActive = (url: string) =>
    url === "/dashboard"
      ? location.pathname === url
      : location.pathname.startsWith(url);

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-white border-r border-border shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
        <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg gradient-text tracking-tight">EduVest</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pb-2 pt-1">
          Main Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/dashboard"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground group",
                active && "nav-active shadow-sm"
              )}
            >
              <span className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                active ? "bg-primary/15" : "bg-muted group-hover:bg-accent"
              )}>
                <item.icon className={cn(
                  "h-4 w-4",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
              </span>
              <span>{item.title}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
