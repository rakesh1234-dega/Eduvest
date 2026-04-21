import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { Bell, CheckSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data: notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="flex flex-col w-full h-[400px] sm:w-[380px] bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/50">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" />
          Notifications
        </h3>
        {notifications && notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => markAllAsRead.mutate()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="flex flex-col">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={(id) => markAsRead.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-medium text-sm">No notifications yet</p>
            <p className="text-xs">When you have updates, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
