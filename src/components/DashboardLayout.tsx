import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/use-profile";

const pageNames: Record<string, string> = {
  "/dashboard":         "Dashboard",
  "/enter-application": "Enter Application",
  "/accounts":          "Accounts",
  "/transactions":      "Transactions",
  "/budget":            "Budget",
  "/analytics":         "Analytics",
};

const pageSubtitles: Record<string, string> = {
  "/dashboard":         "Track your money, performance, and trends — all in one place.",
  "/enter-application": "Log your income and expenses quickly.",
  "/accounts":          "Manage your cash, UPI, and card accounts.",
  "/transactions":      "View and filter all your financial activity.",
  "/budget":            "Set and track your monthly spending limit.",
  "/analytics":         "Visual insights into your financial patterns.",
};

export default function DashboardLayout() {
  const location = useLocation();
  const [dark, setDark] = useState(false);

  const pageName = pageNames[location.pathname] ?? "Dashboard";
  const pageSub  = pageSubtitles[location.pathname] ?? "";

  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    // Redirect if they haven't completed onboarding and the profile has loaded
    if (!profileLoading && (!profile || !profile.onboarding_completed)) {
      navigate("/onboarding", { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center bg-white border-b border-border px-6 gap-4 shrink-0">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2 text-sm text-muted-foreground flex-1 max-w-xs cursor-pointer hover:bg-muted/80 transition-colors">
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

            {/* Notifications */}
            <button className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-accent-foreground relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* Clerk UserButton — shows avatar, name, sign-out, and links to Clerk user profile */}
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

        {/* Page header */}
        <div className="bg-white border-b border-border px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">{pageName}</h1>
          {pageSub && <p className="text-sm text-muted-foreground mt-0.5">{pageSub}</p>}
        </div>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
