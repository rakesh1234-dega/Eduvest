import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./styles/index.css";

import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { ConfigError } from "@/components/ConfigError";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isProd = import.meta.env.PROD;

// ─── Configuration Validation Logic ───

function validateConfig() {
  // 1. Missing Clerk Key
  if (!clerkPubKey) {
    return {
      valid: false,
      type: "clerk" as const,
      message: "Missing VITE_CLERK_PUBLISHABLE_KEY. Please add it to your Vercel Environment Variables."
    };
  }

  // 2. Missing Supabase Config
  if (!isSupabaseConfigured) {
    return {
      valid: false,
      type: "supabase" as const,
      message: "Missing Supabase configuration. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set correctly."
    };
  }

  return { valid: true };
}


const config = validateConfig();

// ─── Render Application ───

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

if (!config.valid) {
  createRoot(rootElement).render(
    <ConfigError 
      errorType={config.type as any} 
      message={config.message as string} 
    />
  );
} else {
  createRoot(rootElement).render(
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  );
}

