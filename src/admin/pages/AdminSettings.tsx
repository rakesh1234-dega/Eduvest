import { useState } from "react";
import { useAdminAuth } from "../AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, User, Lock, Bell, Monitor, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { adminUser, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(adminUser?.name || "Admin");
  const [email, setEmail] = useState(adminUser?.email || "admin@eduvest.com");

  const handleSave = () => {
    toast.success("Settings saved (demo mode)");
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/admin-login", { replace: true });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-muted-foreground text-sm mt-1">Manage admin preferences and profile.</p></div>

      {/* Profile */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-800/50"><h2 className="font-bold text-white flex items-center gap-2"><User className="h-4 w-4 text-indigo-400" /> Admin Profile</h2></div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">Save Changes</button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-800/50"><h2 className="font-bold text-white flex items-center gap-2"><Lock className="h-4 w-4 text-amber-400" /> Security</h2></div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <button onClick={() => toast.success("Password updated (demo)")} className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">Update Password</button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-800/50"><h2 className="font-bold text-white flex items-center gap-2"><Monitor className="h-4 w-4 text-emerald-400" /> Preferences</h2></div>
        <div className="p-5 space-y-3">
          {[
            { label: "Email Notifications", desc: "Receive alerts on new user signups" },
            { label: "Activity Alerts", desc: "Get notified when users reach milestones" },
            { label: "Dark Mode", desc: "Admin panel dark theme (always on)" },
          ].map((pref, i) => (
            <label key={pref.label} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-200">{pref.label}</p>
                <p className="text-xs text-muted-foreground">{pref.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 rounded border-slate-600 text-indigo-600" />
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 rounded-2xl border border-rose-800/30 overflow-hidden">
        <div className="p-5 border-b border-rose-800/30 bg-rose-500/5"><h2 className="font-bold text-rose-400 flex items-center gap-2"><LogOut className="h-4 w-4" /> Session</h2></div>
        <div className="p-5">
          <p className="text-sm text-muted-foreground mb-3">Signing out will end your admin session.</p>
          <button onClick={handleLogout} className="bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm border border-rose-500/20 flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign Out</button>
        </div>
      </div>
    </div>
  );
}
