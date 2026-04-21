import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth";
import { useCreateAccount } from "@/hooks/use-accounts";
import { useUpsertBudget } from "@/hooks/use-budgets";
import { useCreateCategory } from "@/hooks/use-categories";
import { useUpdateProfile, useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, Wallet, PiggyBank, Tag, ArrowRight, Check, Loader2 } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { toast } from "sonner";
import { sendWelcomeEmail } from "@/lib/email/email-client";
import { checkAndMarkEmail } from "@/lib/email/deduplication";

const defaultCategories = [
  { name: "Food & Dining",   type: "expense" as const, color: "#f97316" },
  { name: "Transport",       type: "expense" as const, color: "#3b82f6" },
  { name: "Shopping",        type: "expense" as const, color: "#ec4899" },
  { name: "Education",       type: "expense" as const, color: "#8b5cf6" },
  { name: "Entertainment",   type: "expense" as const, color: "#06b6d4" },
  { name: "Rent & Bills",    type: "expense" as const, color: "#ef4444" },
  { name: "Salary",          type: "income"  as const, color: "#22c55e" },
  { name: "Pocket Money",    type: "income"  as const, color: "#10b981" },
  { name: "Freelance",       type: "income"  as const, color: "#6366f1" },
];

export default function OnboardingPage() {
  const [step, setStep]                         = useState(0);
  const [cashBalance, setCashBalance]           = useState("");
  const [upiBalance, setUpiBalance]             = useState("");
  const [cardBalance, setCardBalance]           = useState("");
  const [monthlyBudget, setMonthlyBudget]       = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultCategories.map((c) => c.name)
  );
  const [saving, setSaving] = useState(false);

  const navigate        = useNavigate();
  const { user }        = useAuth();
  const createAccount   = useCreateAccount();
  const upsertBudget    = useUpsertBudget();
  const createCategory  = useCreateCategory();
  const updateProfile   = useUpdateProfile();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Guard: if already completed setup, skip to dashboard
  useEffect(() => {
    if (!profileLoading && profile?.onboarding_completed) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  const steps = [
    { title: "Welcome",    icon: GraduationCap },
    { title: "Balances",   icon: Wallet },
    { title: "Budget",     icon: PiggyBank },
    { title: "Categories", icon: Tag },
  ];

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleFinish = async () => {
    if (!user) { toast.error("Not logged in"); return; }
    setSaving(true);
    try {
      // Create accounts — first one is default
      const accounts = [
        { name: "Cash", type: "cash" as const, balance: parseFloat(cashBalance) || 0, is_default: true },
        { name: "UPI",  type: "upi"  as const, balance: parseFloat(upiBalance)  || 0 },
        { name: "Card", type: "card" as const, balance: parseFloat(cardBalance) || 0 },
      ];
      for (const acc of accounts) {
        await createAccount.mutateAsync(acc);
      }

      // Set monthly budget
      if (monthlyBudget) {
        await upsertBudget.mutateAsync({
          amount: parseFloat(monthlyBudget),
          month: format(startOfMonth(new Date()), "yyyy-MM-dd"),
        });
      }

      // Create selected categories
      const cats = defaultCategories.filter((c) => selectedCategories.includes(c.name));
      for (const cat of cats) {
        await createCategory.mutateAsync(cat);
      }

      // Mark onboarding complete
      await updateProfile.mutateAsync({ onboarding_completed: true });

      // Send welcome email — once ever, non-blocking
      if (user.email && checkAndMarkEmail(user.id, "welcome", "once_ever")) {
        sendWelcomeEmail(user.email, {
          userName: user.name || user.email.split("@")[0],
        }).catch(() => {
          // Email failure must never block onboarding
        });
      }

      toast.success("Setup complete! Welcome to EduVest 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg rounded-2xl shadow-lg border-0">
        <CardHeader className="pb-2">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "gradient-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(() => { const Icon = steps[step].icon; return <Icon className="h-5 w-5 text-primary" />; })()}
            <CardTitle>{steps[step].title}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* Step 0 – Welcome */}
          {step === 0 && (
            <div className="text-center py-6 space-y-4">
              <div className="h-20 w-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Welcome to BudgetBuddy!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Let's set up your personal finance tracker in under a minute.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 font-medium text-left">
                🔒 <strong>Privacy First:</strong> Your data is stored securely in your own Supabase database. We never track, share, or sell your financial data.
              </div>
            </div>
          )}

          {/* Step 1 – Balances */}
          {step === 1 && (
            <div className="space-y-4">
              <CardDescription>Enter your current balances for each account type.</CardDescription>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>💵 Cash Balance (₹)</Label>
                  <Input type="number" min="0" placeholder="0.00" value={cashBalance} onChange={(e) => setCashBalance(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>📱 UPI Balance (₹)</Label>
                  <Input type="number" min="0" placeholder="0.00" value={upiBalance} onChange={(e) => setUpiBalance(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>💳 Card Balance (₹)</Label>
                  <Input type="number" min="0" placeholder="0.00" value={cardBalance} onChange={(e) => setCardBalance(e.target.value)} className="rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 – Budget */}
          {step === 2 && (
            <div className="space-y-4">
              <CardDescription>How much can you spend this month?</CardDescription>
              <div className="space-y-1.5">
                <Label>Monthly Budget (₹)</Label>
                <Input type="number" min="0" placeholder="e.g. 15000" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} className="rounded-xl" />
              </div>
              <p className="text-xs text-muted-foreground">You can change this anytime in the Budget page.</p>
            </div>
          )}

          {/* Step 3 – Categories */}
          {step === 3 && (
            <div className="space-y-4">
              <CardDescription>Select spending categories you commonly use.</CardDescription>
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    style={selectedCategories.includes(cat.name) ? { background: cat.color } : undefined}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedCategories.includes(cat.name)
                        ? "text-white border-transparent shadow-sm scale-105"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {selectedCategories.includes(cat.name) && <Check className="h-3 w-3 inline mr-1" />}
                    {cat.name}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{selectedCategories.length} categories selected</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-2">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="rounded-xl">
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} className="gradient-primary rounded-xl gap-2">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={saving} className="gradient-primary rounded-xl gap-2">
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
                  ) : (
                    <>Finish Setup <Check className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
