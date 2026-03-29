import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        afterSignInUrl="/dashboard"
        appearance={{
          elements: {
            card: "rounded-2xl shadow-lg",
            formButtonPrimary: "gradient-primary rounded-xl",
            footerActionLink: "text-primary",
          },
        }}
      />
    </div>
  );
}
