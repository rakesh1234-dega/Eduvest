import { Navigate } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { LoadingBuddy } from "./LoadingBuddy";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingBuddy />
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
