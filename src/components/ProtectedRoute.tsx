import { Navigate } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl gradient-primary animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">Loading BudgetBuddy...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
