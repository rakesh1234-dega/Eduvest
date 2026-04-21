import { supabase } from "@/integrations/supabase/client";
import { AppNotification } from "./notification-types";

export const notificationService = {
  getNotifications: async (userId: string): Promise<AppNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("EduVest Notify: DB Fetch Failed", error);
        return [];
      }
      return (data || []) as AppNotification[];
    } catch (err) {
      console.error("EduVest Notify: Fetch Proxy Failed", err);
      return [];
    }
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const notifications = await notificationService.getNotifications(userId);
      return notifications.filter(n => !n.is_read).length;
    } catch (err) {
      console.error("EduVest Notify: Unread Count Proxy Failed", err);
      return 0;
    }
  },

  createNotification: async (
    data: Omit<AppNotification, "id" | "created_at" | "is_read">
  ): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke("notify", {
        body: {
          userId: data.user_id,
          title: data.title,
          message: data.message,
          type: data.type,
          link: data.link || null,
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("EduVest Notify: Edge Function Failed, falling back to direct DB insert", err);
      // Fallback to direct insert since the SQL schema allows it now
      const { error: dbErr } = await supabase.from("notifications").insert([{
        user_id: data.user_id,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link || null,
        is_read: false
      }]);
      if (dbErr) {
        console.error("EduVest Notify: Direct DB Insert Failed", dbErr);
      }
    }
  },

  markAsRead: async (userId: string, notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("user_id", userId); // 🔒 Enforce identity isolation

    if (error) throw error;
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke("notify", {
        method: "PUT",
        body: { userId }
      });
      if (error) throw error;
    } catch (err) {
      console.error("EduVest Notify: Update Proxy Failed, falling back to db", err);
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
    }
  },
};
