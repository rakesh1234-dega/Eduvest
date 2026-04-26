import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "./styles/index.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isProd = import.meta.env.PROD;

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

// ─── Clerk Environment Safety Checks ───
// Detect if the app is accidentally exposing Secret Keys
if (import.meta.env.VITE_CLERK_SECRET_KEY || clerkPubKey.startsWith("sk_")) {
  throw new Error("SECURITY FATAL: Never expose your Clerk Secret Key (sk_test_ / sk_live_) to the frontend via VITE_ variables!");
}

// Ensure development keys aren't used in production
if (isProd && clerkPubKey.startsWith("pk_test_")) {
  throw new Error(
    "SECURITY ERROR: You are using a Clerk development key (pk_test_) in a Production build. " +
    "Please switch to your production keys (pk_live_) in your deployment environment variables."
  );
}

// Warn if production keys are used in local development
if (!isProd && clerkPubKey.startsWith("pk_live_")) {
  console.warn(
    "WARNING: You are using a Clerk production key (pk_live_) in a local development environment. " +
    "It is highly recommended to use development keys (pk_test_) locally to avoid polluting live user data."
  );
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
);
