import { useAuth } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Mail, LogOut, Save, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  const handleSave = async () => {
    await updateProfile.mutateAsync({ display_name: displayName });
    toast.success("Profile updated!");
  };

  const initials = (displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{displayName || "Your Name"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md">
              ✓ Verified Student
            </span>
          </div>
        </div>

        <div className="h-px bg-border mb-6" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Display Name</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="rounded-xl bg-muted/30 border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={user?.email || ""}
                  disabled
                  className="pl-9 rounded-xl bg-muted/50 border-border text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="gradient-primary rounded-xl gap-2"
            disabled={updateProfile.isPending}
          >
            <Save className="h-4 w-4" />
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Security card */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-primary" /> Security & Privacy
        </h3>
        <div className="space-y-3 mb-5">
          {[
            { icon: Lock,   label: "Row-level Security", desc: "Your data is only accessible by you through Supabase RLS policies." },
            { icon: Shield, label: "Encrypted Storage",  desc: "All sensitive financial data is encrypted at rest and in transit."  },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-border mb-4" />

        <div>
          <p className="text-sm text-muted-foreground mb-3">Signing out will end your current session on this device.</p>
          <Button
            variant="outline"
            className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-xl gap-2"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

    </div>
  );
}
