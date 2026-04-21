import { createContext, useContext, useState, ReactNode } from "react";

interface AdminAuth {
  isAdminLoggedIn: boolean;
  adminUser: { name: string; email: string; role: string } | null;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuth>({
  isAdminLoggedIn: false,
  adminUser: null,
  adminLogin: () => false,
  adminLogout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem("eduvest_admin_auth") === "true";
  });

  const [adminUser, setAdminUser] = useState<AdminAuth["adminUser"]>(() => {
    const stored = sessionStorage.getItem("eduvest_admin_user");
    return stored ? JSON.parse(stored) : null;
  });

  const adminLogin = (username: string, password: string): boolean => {
    // Demo credentials
    if (
      (username === "admin" && password === "admin123") ||
      (username === "admin@eduvest.com" && password === "admin123")
    ) {
      const user = { name: "Admin", email: "admin@eduvest.com", role: "super_admin" };
      setIsAdminLoggedIn(true);
      setAdminUser(user);
      sessionStorage.setItem("eduvest_admin_auth", "true");
      sessionStorage.setItem("eduvest_admin_user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    sessionStorage.removeItem("eduvest_admin_auth");
    sessionStorage.removeItem("eduvest_admin_user");
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminLoggedIn, adminUser, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
