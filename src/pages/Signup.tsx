import { SignUp } from "@clerk/clerk-react";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        afterSignUpUrl="/onboarding"
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
