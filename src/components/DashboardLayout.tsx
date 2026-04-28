import { AppSidebar } from "@/components/AppSidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Outlet, useLocation } from "react-router-dom";
import { Search, Moon, Sun, Menu, Wallet, Calendar, Trophy, ClipboardList, PiggyBank, BarChart3, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AiChat } from "@/components/AiChat";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";
import { useAuth } from "@/utils/auth";
import { startScheduleNotifications, stopScheduleNotifications } from "@/utils/schedule-notifications";
import { toast } from "sonner";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schedule": "Schedule",
  "/leaderboard": "Leaderboard",
  "/admin": "Admin Dashboard",
  "/expense": "Expense",
  "/accounts": "Accounts",
  "/transactions": "Transactions",
  "/budget": "Budget",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

const pageSubtitles: Record<string, string> = {
  "/dashboard": "Track your money, performance, and trends — all in one place.",
  "/schedule": "Your manually planned routine for a balanced and productive week.",
  "/leaderboard": "See how you stack up against top savers.",
  "/inbox": "Read messages and notifications from EdVest Admin.",
  "/admin": "Manage users and application settings.",
  "/expense": "Log your income and expenses quickly.",
  "/accounts": "Manage your cash, UPI, and card accounts.",
  "/transactions": "View and filter all your financial activity.",
  "/budget": "Set and track your monthly spending limit.",
  "/analytics": "Visual insights into your financial patterns.",
  "/settings": "Manage your profile and app preferences.",
};

export default function DashboardLayout() {
  const location = useLocation();
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const pageName = pageNames[location.pathname] ?? "Dashboard";

  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!profileLoading && (!profile || !profile.onboarding_completed)) {
      navigate("/onboarding", { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  const { user: authUser } = useAuth();

  // Start schedule notifications (user-scoped)
  useEffect(() => {
    startScheduleNotifications(authUser?.id);

    const handleScheduleNotif = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.block) {
        toast.info(`${detail.block.icon} ${detail.block.activity}`, {
          description: `It's ${detail.block.time} — time for this task!`,
          duration: 8000,
        });
      }
    };

    window.addEventListener("schedule-notification", handleScheduleNotif);
    return () => {
      stopScheduleNotifications();
      window.removeEventListener("schedule-notification", handleScheduleNotif);
    };
  }, [authUser?.id]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const searchItems = [
    { name: "Dashboard", path: "/dashboard", icon: <Wallet className="h-4 w-4" /> },
    { name: "Schedule", path: "/schedule", icon: <Calendar className="h-4 w-4" /> },
    { name: "Leaderboard", path: "/leaderboard", icon: <Trophy className="h-4 w-4" /> },
    { name: "Expense", path: "/expense", icon: <ClipboardList className="h-4 w-4" /> },
    { name: "Accounts", path: "/accounts", icon: <Wallet className="h-4 w-4" /> },
    { name: "Transactions", path: "/transactions", icon: <Wallet className="h-4 w-4" /> },
    { name: "Budget", path: "/budget", icon: <PiggyBank className="h-4 w-4" /> },
    { name: "Analytics", path: "/analytics", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-4 w-4" /> },
  ];

  const filteredSearch = searchItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSearchNav = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex w-full bg-background min-w-[320px]">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} className="hidden lg:flex" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="h-16 flex items-center bg-card border-b border-border px-4 md:px-6 gap-4 shrink-0 transition-colors sticky top-0 z-30 backdrop-blur-sm bg-card/95">
          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-9 w-9 rounded-xl flex items-center justify-center lg:hidden hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60 border-r-0 bg-card">
              <AppSidebar collapsed={false} onToggle={() => {}} className="flex" />
            </SheetContent>
          </Sheet>
          {/* Search bar */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-muted rounded-xl px-4 py-2 text-sm text-muted-foreground w-64 cursor-pointer hover:bg-muted/80 transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span>Search…</span>
            <span className="ml-auto text-xs bg-background border border-border rounded px-1.5 py-0.5 font-mono">⌘K</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Dark mode */}
            <button
              onClick={() => setDark(!dark)}
              className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Points UI */}
            <div
              key={profile?.points}
              className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-xl shadow-sm animate-in zoom-in duration-300"
              title="Your Points"
            >
              <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">⭐</div>
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{profile?.points || 0}</span>
            </div>

            {/* Smart Assistant */}
            <AiChat />

            {/* Notifications */}
            <NotificationBell />

            {/* Clerk UserButton */}
            <div className="flex items-center pl-3 border-l border-border h-8">
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8 rounded-xl",
                    userButtonOuterIdentifier: "text-sm font-semibold text-foreground hidden sm:block",
                  },
                }}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-card rounded-2xl border-border/50">
          <div className="border-b border-border/50 p-3">
            <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input 
                autoFocus
                placeholder="Search pages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground"
              />
              <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border shadow-sm font-mono uppercase tracking-wider">ESC</span>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filteredSearch.length > 0 ? (
              <div className="space-y-1">
                {filteredSearch.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleSearchNav(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium text-foreground text-left"
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No results found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
