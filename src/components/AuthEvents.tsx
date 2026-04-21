import { useWelcomeTrigger } from "@/hooks/use-welcome-trigger";

/**
 * AuthEvents component
 * A headless component that listens for auth state changes
 * and triggers background events (like Welcome emails).
 */
export const AuthEvents = () => {
  useWelcomeTrigger();
  return null;
};
