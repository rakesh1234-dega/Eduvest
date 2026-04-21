import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/utils/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import LandingPage from "@/pages/Landing";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import OnboardingPage from "@/pages/Onboarding";
import DashboardPage from "@/pages/Dashboard";
import AccountsPage from "@/pages/Accounts";
import SchedulePage from "@/pages/Schedule";
import TransactionsPage from "@/pages/Transactions";
import BudgetPage from "@/pages/Budget";
import AnalyticsPage from "@/pages/Analytics";
import ExpensePage from "@/pages/Expense";
import SettingsPage from "@/pages/Settings";
import LeaderboardPage from "@/pages/Leaderboard";
import InboxPage from "@/pages/Inbox";
import NotFound from "@/pages/NotFound";
import { AuthEvents } from "@/components/AuthEvents";

// ─── Admin Application ───
import { AdminAuthProvider } from "@/admin/AdminAuthContext";
import { AdminProtectedRoute } from "@/admin/AdminProtectedRoute";
import AdminLoginPage from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import AdminHome from "@/admin/pages/AdminHome";
import AdminUsers from "@/admin/pages/AdminUsers";
import AdminMessages from "@/admin/pages/AdminMessages";
import AdminAnnouncements from "@/admin/pages/AdminAnnouncements";
import AdminActivity from "@/admin/pages/AdminActivity";
import AdminReports from "@/admin/pages/AdminReports";
import AdminSettings from "@/admin/pages/AdminSettings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AdminAuthProvider>
            <AuthEvents />
            <Routes>
              {/* ── User Application ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/expense" element={<ExpensePage />} />
                <Route path="/accounts" element={<AccountsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/inbox" element={<InboxPage />} />
              </Route>

              {/* ── Admin Application (Completely Separate) ── */}
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/activity" element={<AdminActivity />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
