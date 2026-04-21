import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Search, Eye, Star, Send, X, Activity, ArrowUpRight, ArrowDownRight, ArrowLeftRight, Zap, Shield } from "lucide-react";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState<any>(null);
  const [detailTx, setDetailTx] = useState<any[]>([]);
  const [detailActivity, setDetailActivity] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("points", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const openDetail = async (user: any) => {
    setDetailUser(user);
    setDetailLoading(true);
    const [tx, act] = await Promise.all([
      supabase.from("transactions").select("*, categories(name), accounts(name)").eq("user_id", user.user_id).order("date", { ascending: false }).limit(15),
      supabase.from("activity_logs").select("*").eq("user_id", user.user_id).order("created_at", { ascending: false }).limit(15),
    ]);
    setDetailTx(tx.data || []);
    setDetailActivity(act.data || []);
    setDetailLoading(false);
  };

  const toggleRole = async (user: any) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    toast.success(`${user.display_name} is now ${newRole}`);
    fetchUsers();
    if (detailUser?.id === user.id) setDetailUser({ ...detailUser, role: newRole });
  };

  const filtered = users.filter(u => {
    const matchSearch = (u.display_name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || (u.role || "user") === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all registered users and their data.</p>
        </div>
        <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full text-sm font-bold">{users.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        {["all", "user", "admin"].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)} className={cn("px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors", roleFilter === r ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>{r}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/50">
                <th className="py-3 px-4 text-left text-xs text-muted-foreground font-semibold">User</th>
                <th className="py-3 px-4 text-left text-xs text-muted-foreground font-semibold">Email</th>
                <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Role</th>
                <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Level</th>
                <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Points</th>
                <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">{u.display_name?.charAt(0) || "U"}</div>
                      <p className="font-semibold text-slate-200">{u.display_name || "Unknown"}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-[180px] truncate">{u.email || "—"}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn("px-2 py-1 text-[10px] font-bold rounded-md uppercase", u.role === "admin" ? "bg-rose-500/10 text-rose-400" : "bg-slate-700 text-slate-400")}>{u.role || "user"}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-indigo-400 font-bold">{u.level || 1}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg text-xs font-bold"><Star className="h-3 w-3" />{u.points || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => openDetail(u)} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1 mx-auto"><Eye className="h-3.5 w-3.5" /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No users found.</div>}
        </div>
      </div>

      {/* Detail Drawer */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={() => setDetailUser(null)}>
          <div className="bg-slate-900 w-full max-w-lg h-full overflow-y-auto border-l border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">{detailUser.display_name?.charAt(0) || "U"}</div>
                <div>
                  <h2 className="text-lg font-bold text-white">{detailUser.display_name || "Unknown"}</h2>
                  <p className="text-indigo-200 text-sm">{detailUser.email || "No email"}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30"><X className="h-4 w-4" /></button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800">
              <div className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase font-bold">Points</p><p className="text-xl font-bold text-indigo-400">{detailUser.points || 0}</p></div>
              <div className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase font-bold">Level</p><p className="text-xl font-bold text-emerald-400">{detailUser.level || 1}</p></div>
              <div className="p-4 text-center"><p className="text-[10px] text-muted-foreground uppercase font-bold">Role</p><p className={cn("text-xl font-bold", detailUser.role === "admin" ? "text-rose-400" : "text-slate-300")}>{detailUser.role || "user"}</p></div>
            </div>

            {/* Actions */}
            <div className="p-4 border-b border-slate-800 flex gap-2">
              <button onClick={() => toggleRole(detailUser)} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors", detailUser.role === "admin" ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20" : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20")}>
                <Shield className="h-4 w-4 inline mr-1" /> {detailUser.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
            </div>

            <div className="p-5 space-y-6">
              {detailLoading ? <p className="text-muted-foreground text-center py-8">Loading...</p> : (
                <>
                  {/* Activity */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-indigo-400" /> Activity ({detailActivity.length})</h3>
                    <div className="space-y-2">
                      {detailActivity.map(a => (
                        <div key={a.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
                          <div>
                            <p className="text-xs font-medium text-slate-300">{a.activity_type?.replace(/_/g, " ")}</p>
                            <p className="text-[10px] text-muted-foreground">{format(new Date(a.created_at), "MMM d, h:mm a")}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">+{a.points_awarded}</span>
                        </div>
                      ))}
                      {detailActivity.length === 0 && <p className="text-xs text-muted-foreground">No activity.</p>}
                    </div>
                  </div>

                  {/* Transactions */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ArrowLeftRight className="h-4 w-4 text-indigo-400" /> Transactions ({detailTx.length})</h3>
                    <div className="space-y-2">
                      {detailTx.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", tx.type === "income" ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                              {tx.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> : <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-slate-300">{tx.description || tx.type}</p>
                              <p className="text-[10px] text-muted-foreground">{tx.categories?.name || "—"} • {format(new Date(tx.date), "MMM d")}</p>
                            </div>
                          </div>
                          <span className={cn("text-xs font-bold", tx.type === "income" ? "text-emerald-400" : "text-rose-400")}>{tx.type === "income" ? "+" : "-"}₹{tx.amount}</span>
                        </div>
                      ))}
                      {detailTx.length === 0 && <p className="text-xs text-muted-foreground">No transactions.</p>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
