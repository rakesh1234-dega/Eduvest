import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MailOpen, Trash2, Clock, Shield, Inbox as InboxIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

export default function InboxPage() {
  const { data: profile } = useProfile();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchMessages();
    }
  }, [profile?.id]);

  const fetchMessages = async () => {
    setLoading(true);
    let allMessages = [];

    // Fetch from messages table
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", profile?.id)
      .order("created_at", { ascending: false });

    if (!messagesError && messagesData) {
      allMessages = [...messagesData];
    }

    // Fetch from notifications table as fallback/extension
    if (profile?.user_id) {
      const { data: notifData, error: notifError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", profile.user_id)
        .eq("type", "message")
        .order("created_at", { ascending: false });

      if (!notifError && notifData) {
        // Map notifications to look like messages
        const mappedNotifs = notifData.map(n => ({
          id: n.id,
          recipient_id: profile.id, // mapped
          subject: n.title,
          body: n.message,
          is_read: n.is_read,
          created_at: n.created_at,
          _source: "notification"
        }));
        
        // Merge and deduplicate (just appending is fine if they are distinct, but just in case we can use unique IDs)
        allMessages = [...allMessages, ...mappedNotifs];
      }
    }

    // Sort combined messages
    allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setMessages(allMessages);
    setLoading(false);
  };

  const markAsRead = async (id: string, source?: string) => {
    try {
      if (source === "notification") {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id);
        if (!error) {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        }
      } else {
        const { error } = await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("id", id);
        if (!error) {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        }
      }
    } catch (err) {}
  };

  const toggleExpand = (id: string, isRead: boolean, source?: string) => {
    if (!isRead) markAsRead(id, source);
    setExpandedId(prev => prev === id ? null : id);
  };

  const deleteMessage = async (e: React.MouseEvent, msg: any) => {
    e.stopPropagation();
    try {
      if (msg._source === "notification") {
        const { error } = await supabase.from("notifications").delete().eq("id", msg.id);
        if (!error) {
          setMessages(prev => prev.filter(m => m.id !== msg.id));
          toast.success("Message deleted");
        } else {
          toast.error("Failed to delete message");
        }
      } else {
        const { error } = await supabase.from("messages").delete().eq("id", msg.id);
        if (!error) {
          setMessages(prev => prev.filter(m => m.id !== msg.id));
          toast.success("Message deleted");
        } else {
          toast.error("Failed to delete message");
        }
      }
    } catch (err) {}
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Inbox</h1>
          <p className="text-muted-foreground font-medium tracking-tight">Messages from the EduVest Admin team.</p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-bold">
            <Mail className="h-4 w-4" />
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center text-muted-foreground">
            <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <InboxIcon className="h-10 w-10 text-slate-300" />
            </div>
            <p className="font-medium text-lg text-slate-700">You're all caught up!</p>
            <p className="text-sm mt-1">No messages from the admin team yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {messages.map((m) => (
              <div key={m.id}>
                <div
                  className={cn(
                    "p-5 sm:p-6 transition-all hover:bg-muted cursor-pointer group flex items-start gap-4 sm:gap-5",
                    !m.is_read ? "bg-indigo-50/40" : "bg-card",
                    expandedId === m.id && "bg-muted"
                  )}
                  onClick={() => toggleExpand(m.id, m.is_read, m._source)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={cn(
                      "h-11 w-11 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                      !m.is_read
                        ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white"
                        : "bg-muted text-slate-400"
                    )}>
                      {!m.is_read ? <Mail className="h-5 w-5" /> : <MailOpen className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className={cn(
                          "font-semibold text-base truncate",
                          !m.is_read ? "text-indigo-900 font-bold" : "text-foreground"
                        )}>
                          {m.subject}
                        </h3>
                        {!m.is_read && (
                          <span className="shrink-0 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1.5 shrink-0">
                        <Clock className="h-3 w-3" />
                        {format(new Date(m.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>

                    {/* From badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="h-3 w-3 text-indigo-400" />
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">From Admin</span>
                    </div>

                    {/* Preview or full body */}
                    <p className={cn(
                      "text-sm leading-relaxed",
                      !m.is_read ? "text-slate-700 font-medium" : "text-muted-foreground",
                      expandedId !== m.id && "line-clamp-2"
                    )}>
                      {m.body}
                    </p>
                  </div>

                  {/* Delete button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:flex items-center">
                    <button
                      onClick={(e) => deleteMessage(e, m)}
                      className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === m.id && (
                  <div className="px-6 pb-5 pt-0 bg-muted border-t border-border">
                    <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{m.body}</p>
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                        <span className="text-[10px] text-slate-400">
                          Received {format(new Date(m.created_at), "EEEE, MMMM do yyyy 'at' h:mm a")}
                        </span>
                        <button
                          onClick={(e) => deleteMessage(e, m)}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
