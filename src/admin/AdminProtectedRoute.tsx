import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdminLoggedIn } = useAdminAuth();
  if (!isAdminLoggedIn) return <Navigate to="/admin-login" replace />;
  return <>{children}</>;
}
