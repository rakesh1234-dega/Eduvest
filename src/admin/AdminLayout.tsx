import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";
import {
  LayoutDashboard, Users, MessageSquare, Megaphone, Activity,
  BarChart3, Settings, LogOut, ShieldCheck, Search, Bell, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

const sidebarItems = [
  { label: "Dashboard",     path: "/admin",               icon: LayoutDashboard },
  { label: "Users",          path: "/admin/users",         icon: Users },
  { label: "Messages",      path: "/admin/messages",      icon: MessageSquare },
  { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
  { label: "User Activity", path: "/admin/activity",      icon: Activity },
  { label: "Reports",       path: "/admin/reports",        icon: BarChart3 },
  { label: "Settings",      path: "/admin/settings",       icon: Settings },
];

export default function AdminLayout() {
  const { adminUser, adminLogout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight">EduVest</span>
            <span className="text-[10px] text-indigo-400 font-semibold block -mt-0.5">ADMIN PANEL</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pb-2 pt-1">Navigation</p>
          {sidebarItems.map((item) => {
            const isActive = item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <span className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                  isActive ? "bg-indigo-500/20" : "bg-slate-800"
                )}>
                  <item.icon className={cn("h-4 w-4", isActive ? "text-indigo-400" : "text-muted-foreground")} />
                </span>
                <span>{item.label}</span>
                {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom profile + Logout */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{adminUser?.name || "Admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center px-6 gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-4 py-2.5 text-sm text-muted-foreground flex-1 max-w-sm">
            <Search className="h-4 w-4" />
            <span>Search users, messages…</span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-xs text-muted-foreground font-medium hidden md:block">
              {format(new Date(), "EEEE, MMM do yyyy • h:mm a")}
            </span>
            <button className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 border-2 border-slate-900" />
            </button>
            <button
              onClick={() => navigate("/admin/messages")}
              className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Send Message
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-950 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
