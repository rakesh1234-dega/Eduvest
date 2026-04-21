import {
  LayoutDashboard, Wallet, ArrowLeftRight, PiggyBank, BarChart3,
  GraduationCap, ClipboardList, Settings, Trophy, Shield, Mail, CalendarDays,
  PanelLeftClose, PanelLeft
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/utils";
import { useProfile } from "@/hooks/use-profile";
import { useUser } from "@clerk/clerk-react";

const navItems = [
  { title: "Dashboard",        url: "/dashboard",         icon: LayoutDashboard, adminOnly: false },
  { title: "Schedule",         url: "/schedule",          icon: CalendarDays,    adminOnly: false },
  { title: "Leaderboard",      url: "/leaderboard",       icon: Trophy,          adminOnly: false },
  { title: "Expense",          url: "/expense",           icon: ClipboardList,   adminOnly: false },
  { title: "Accounts",         url: "/accounts",          icon: Wallet,          adminOnly: false },
  { title: "Transactions",     url: "/transactions",      icon: ArrowLeftRight,  adminOnly: false },
  { title: "Budget",           url: "/budget",            icon: PiggyBank,       adminOnly: false },
  { title: "Analytics",        url: "/analytics",         icon: BarChart3,       adminOnly: false },
  { title: "Inbox",            url: "/inbox",             icon: Mail,            adminOnly: false },
  { title: "Settings",         url: "/settings",          icon: Settings,        adminOnly: false },
  { title: "Admin Portal",     url: "/admin-login",       icon: Shield,          adminOnly: true },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { data: profile } = useProfile();
  const { user } = useUser();

  const ADMIN_EMAILS = [
    "degarakesh72@gmail.com",
    "mujahidsalihadam@gmail.com",
    "russell.grg13@gmail.com"
  ];

  const isAdminEmail = ADMIN_EMAILS.includes(user?.primaryEmailAddress?.emailAddress || "");

  const isActive = (url: string) =>
    url === "/dashboard"
      ? location.pathname === url
      : location.pathname.startsWith(url);

  return (
    <aside
      className={cn(
        "min-h-screen flex flex-col bg-card border-r border-border shrink-0 transition-all duration-300 ease-in-out sticky top-0 h-screen overflow-y-auto",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-border shrink-0",
        collapsed ? "px-3 justify-center" : "px-4 gap-3"
      )}>
        {!collapsed && (
          <>
            <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center shadow-sm shrink-0">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text tracking-tight whitespace-nowrap">EduVest</span>
            <button
              onClick={onToggle}
              className="ml-auto h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity"
            title="Expand sidebar"
          >
            <PanelLeft className="h-4 w-4 text-white" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pb-2 pt-1">
            Main Menu
          </p>
        )}
        {navItems.map((item) => {
          if (item.adminOnly && profile?.role !== "admin" && !isAdminEmail) return null;
          
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/dashboard"}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground group",
                active && "nav-active shadow-sm",
                collapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5"
              )}
              title={collapsed ? item.title : undefined}
            >
              <span className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                active ? "bg-primary/15" : "bg-muted group-hover:bg-accent"
              )}>
                <item.icon className={cn(
                  "h-4 w-4",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                )} />
              </span>
              {!collapsed && (
                <>
                  <span className="whitespace-nowrap">{item.title}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
