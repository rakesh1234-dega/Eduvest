import { createContext, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useUser, useClerk } from "@clerk/clerk-react";

type AuthContextType = {
  session: any;
  user: { id: string; email: string; name: string } | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded: sessionLoaded, session } = useSession();
  const { isLoaded: userLoaded, user } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const loading = !sessionLoaded || !userLoaded;

  // Try to sync Clerk session with Supabase using the "supabase" JWT template
  // This enables RLS to work by making auth.clerk_user_id() return the Clerk user ID.
  // If the JWT template is not configured in Clerk dashboard, it falls back gracefully.
  useEffect(() => {
    if (!session || loading) return;
    const syncClerkToSupabase = async () => {
      try {
        const token = await session.getToken({ template: "supabase" });
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: "",
          });
        }
      } catch {
        // JWT template not set up in Clerk — data still saves via client-side user_id filtering
      }
    };
    syncClerkToSupabase();
  }, [session, loading]);

  const signOut = async () => {
    await supabase.auth.signOut();
    await clerkSignOut();
  };

  const normalizedUser = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress || "",
      }
    : null;

  return (
    <AuthContext.Provider value={{ session, user: normalizedUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
