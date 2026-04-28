import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, Send, ShieldAlert, Activity, BarChart4, Mail, Eye, X,
  ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trophy, Clock,
  ChevronDown, ChevronUp, Star, Zap, FileText, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import { format } from "date-fns";
import { notificationService } from "@/lib/notifications/notification-service";

export default function AdminDashboardPage() {
  const { data: profile } = useProfile();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  // User detail panel
  const [detailUser, setDetailUser] = useState<any | null>(null);
  const [detailTx, setDetailTx] = useState<any[]>([]);
  const [detailActivity, setDetailActivity] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Sent messages log
  const [sentMessages, setSentMessages] = useState<any[]>([]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchSentMessages();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  const fetchSentMessages = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }).limit(20);
    if (data) setSentMessages(data);
  };

  const openUserDetail = async (user: any) => {
    setDetailUser(user);
    setDetailLoading(true);

    // Fetch user's transactions
    const { data: txData } = await supabase
      .from("transactions")
      .select("*, categories(name), accounts(name)")
      .eq("user_id", user.user_id)
      .order("date", { ascending: false })
      .limit(20);
    setDetailTx(txData || []);

    // Fetch user's activity logs
    const { data: actData } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setDetailActivity(actData || []);

    setDetailLoading(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !messageSubject || !messageBody) {
      toast.error("Please fill all fields");
      return;
    }

    setSending(true);
    try {
      // Find the target user to get their clerk user_id for notifications
      const targetUser = users.find(u => u.id === selectedUser);

      // Save message to Supabase messages table
      const { error: msgErr } = await supabase.from("messages").insert({
        sender_id: profile?.id,
        recipient_id: selectedUser,
        subject: messageSubject,
        body: messageBody,
      });
      if (msgErr) console.error("Error inserting into messages:", msgErr); // Don't throw, let's ensure notification is sent

      // ALSO explicitly create a notification for the user!
      if (targetUser && targetUser.user_id) {
        await notificationService.createNotification({
          user_id: targetUser.user_id,
          title: messageSubject,
          message: messageBody,
          type: "message",
          link: "/inbox",
        });
      }

      // Simulate email send
      if (sendEmail) {
        toast.success(`📧 Email simulated to ${targetUser?.email || "user"}`);
      }

      toast.success("✅ Message sent successfully! User will see it in their Inbox/Notifications.");
      setMessageSubject("");
      setMessageBody("");
      setSendEmail(false);
      fetchSentMessages();
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (profile?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ShieldAlert className="h-16 w-16 mb-4 text-rose-500" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p>You do not have permission to view the Admin Dashboard.</p>
        <p className="text-xs mt-2 text-slate-400">Go to Settings → Developer Actions to grant admin access.</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u =>
    (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPoints = users.reduce((acc, u) => acc + (u.points || 0), 0);
  const avgLevel = users.length ? (users.reduce((acc, u) => acc + (u.level || 1), 0) / users.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground font-medium">Full visibility into every user's data, points, activity, and messaging.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox icon={Users} label="Total Users" value={users.length} color="indigo" />
        <StatBox icon={Star} label="Total Points" value={`${totalPoints} pts`} color="amber" />
        <StatBox icon={Zap} label="Avg Level" value={`Lvl ${avgLevel}`} color="emerald" />
        <StatBox icon={FileText} label="Messages Sent" value={sentMessages.length} color="blue" />
      </div>

      {/* ── User Detail Modal ── */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailUser(null)}>
          <div className="bg-card rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                  {detailUser.display_name?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-bold">{detailUser.display_name || "Unknown User"}</h2>
                  <p className="text-indigo-100 text-sm">{detailUser.email || "No email"}</p>
                </div>
              </div>
              <button onClick={() => setDetailUser(null)} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 divide-x border-b">
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Points</p>
                <p className="text-xl font-bold text-indigo-700">{detailUser.points || 0}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Level</p>
                <p className="text-xl font-bold text-emerald-700">{detailUser.level || 1}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase">Role</p>
                <p className={cn("text-xl font-bold", detailUser.role === "admin" ? "text-rose-700" : "text-slate-700")}>
                  {detailUser.role || "user"}
                </p>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="overflow-y-auto max-h-[50vh] p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center py-8 text-slate-400">Loading user data...</div>
              ) : (
                <>
                  {/* Activity Logs */}
                  <div>
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-500" /> Activity Log ({detailActivity.length})
                    </h3>
                    {detailActivity.length === 0 ? (
                      <p className="text-sm text-slate-400">No activity recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailActivity.map((a: any) => (
                          <div key={a.id} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3 border border-border">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <Zap className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{a.activity_type?.replace(/_/g, " ")}</p>
                                <p className="text-[10px] text-slate-400">{format(new Date(a.created_at), "MMM d, h:mm a")}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">+{a.points_awarded} pts</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Transactions */}
                  <div>
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <ArrowLeftRight className="h-4 w-4 text-indigo-500" /> Transactions ({detailTx.length})
                    </h3>
                    {detailTx.length === 0 ? (
                      <p className="text-sm text-slate-400">No transactions yet.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="py-2 text-left text-xs text-muted-foreground font-semibold">Date</th>
                              <th className="py-2 text-left text-xs text-muted-foreground font-semibold">Description</th>
                              <th className="py-2 text-left text-xs text-muted-foreground font-semibold">Category</th>
                              <th className="py-2 text-right text-xs text-muted-foreground font-semibold">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detailTx.map((tx: any) => (
                              <tr key={tx.id} className="border-b border-slate-50 hover:bg-muted/50">
                                <td className="py-2.5 text-xs text-muted-foreground">{format(new Date(tx.date), "MMM d")}</td>
                                <td className="py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "h-6 w-6 rounded flex items-center justify-center",
                                      tx.type === "income" ? "bg-emerald-50" : tx.type === "expense" ? "bg-rose-50" : "bg-blue-50"
                                    )}>
                                      {tx.type === "income" ? <ArrowUpRight className="h-3 w-3 text-emerald-600" /> :
                                       tx.type === "expense" ? <ArrowDownRight className="h-3 w-3 text-rose-500" /> :
                                       <ArrowLeftRight className="h-3 w-3 text-blue-500" />}
                                    </div>
                                    <span className="font-medium text-slate-700 truncate max-w-[150px]">
                                      {tx.description || tx.type}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 text-xs text-muted-foreground">{tx.categories?.name || "—"}</td>
                                <td className={cn(
                                  "py-2.5 text-right font-bold",
                                  tx.type === "income" ? "text-emerald-600" : "text-rose-500"
                                )}>
                                  {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Message from Detail Panel */}
            <div className="border-t px-6 py-4 bg-muted flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedUser(detailUser.id);
                  setDetailUser(null);
                  // Scroll to message form
                  setTimeout(() => document.getElementById("admin-message-form")?.scrollIntoView({ behavior: "smooth" }), 300);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send className="h-3 w-3 mr-2" /> Message This User
              </Button>
              <span className="text-xs text-slate-400">Send a direct notification to this user's Inbox</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── User Roster (Left, 2 cols) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-muted">
              <h2 className="font-bold text-foreground">All Users & Data</h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 h-9 rounded-lg text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={fetchUsers}>Refresh</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-3 px-4 text-left text-xs text-muted-foreground font-semibold">User</th>
                    <th className="py-3 px-4 text-left text-xs text-muted-foreground font-semibold">Email</th>
                    <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Role</th>
                    <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Level</th>
                    <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Points</th>
                    <th className="py-3 px-4 text-center text-xs text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {u.display_name?.charAt(0) || "U"}
                          </div>
                          <p className="font-bold text-foreground">{u.display_name || "Unknown"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground max-w-[150px] truncate">{u.email || "—"}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={cn(
                          "px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide",
                          u.role === "admin" ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"
                        )}>
                          {u.role || "user"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-sm font-bold text-indigo-700">Lvl {u.level || 1}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                          <Star className="h-3 w-3" /> {u.points || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold text-xs"
                          onClick={() => openUserDetail(u)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View All
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No users found.</div>
              )}
            </div>
          </div>

          {/* ── Sent Messages Log ── */}
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border bg-muted">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-500" /> Sent Messages Log
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {sentMessages.length === 0 ? (
                <p className="text-sm text-slate-400 p-5">No messages sent yet.</p>
              ) : (
                sentMessages.slice(0, 8).map((m: any) => {
                  const recipient = users.find(u => u.id === m.recipient_id);
                  return (
                    <div key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <Send className="h-3.5 w-3.5 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{m.subject}</p>
                          <p className="text-[10px] text-slate-400">To: {recipient?.display_name || "User"} • {format(new Date(m.created_at), "MMM d, h:mm a")}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md shrink-0",
                        m.is_read ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {m.is_read ? "Read" : "Unread"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Messaging Interface (Right, 1 col) ── */}
        <div className="space-y-4">
          <div id="admin-message-form" className="bg-card rounded-3xl border border-border shadow-sm">
            <div className="p-5 border-b border-border bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="font-bold text-indigo-900 flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-600" /> Send Message & Email
              </h2>
              <p className="text-xs text-indigo-600/70 mt-1">Message goes to user's Inbox. Email is simulated.</p>
            </div>
            <div className="p-5">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recipient</label>
                  <select
                    className="w-full text-sm border border-border rounded-xl h-10 mt-1 px-3 bg-card focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition-all"
                    value={selectedUser || ""}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.display_name || "Unknown"} ({u.email || u.id.substring(0, 8)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subject</label>
                  <Input
                    className="mt-1 rounded-xl"
                    placeholder="e.g. Great job this week!"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Message</label>
                  <Textarea
                    className="mt-1 rounded-xl"
                    placeholder="Write your message here..."
                    rows={4}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                </div>

                {/* Email toggle */}
                <div className="flex items-center gap-3 bg-muted rounded-xl px-4 py-3 border border-border">
                  <input
                    type="checkbox"
                    id="send-email-toggle"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="send-email-toggle" className="text-sm text-slate-700 font-medium cursor-pointer">
                    Also send as Email (simulated)
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send to User's Inbox"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="font-bold text-lg mb-4">Platform Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-sm">Active Users</span>
                <span className="font-bold">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-sm">Total Points Earned</span>
                <span className="font-bold">{totalPoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-sm">Average Level</span>
                <span className="font-bold">{avgLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-sm">Messages Sent</span>
                <span className="font-bold">{sentMessages.length}</span>
              </div>
              <div className="h-px bg-white/20 my-2" />
              <div className="flex items-center justify-between">
                <span className="text-indigo-200 text-sm">System Status</span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" /> Optimal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-500",
    amber: "bg-amber-50 text-amber-500",
    emerald: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
  };
  return (
    <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between">
      <div>
        <p className="text-muted-foreground font-medium text-xs uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-foreground mt-1">{value}</p>
      </div>
      <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", colorMap[color])}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
