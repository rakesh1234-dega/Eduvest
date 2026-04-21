import { AppNotification } from "@/lib/notifications/notification-types";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Info, AlertTriangle, XCircle, ExternalLink } from "lucide-react";
import { cn } from "@/utils/utils";

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error": return <XCircle className="w-5 h-5 text-rose-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    if (notification.is_read) return "bg-card hover:bg-muted";
    switch (notification.type) {
      case "success": return "bg-emerald-50 hover:bg-emerald-100/80";
      case "warning": return "bg-amber-50 hover:bg-amber-100/80";
      case "error": return "bg-rose-50 hover:bg-rose-100/80";
      case "info":
      default:
        return "bg-blue-50 hover:bg-blue-100/80";
    }
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 cursor-pointer border-b border-border transition-colors flex gap-3 relative overflow-hidden group",
        getBgColor(),
        !notification.is_read && "shadow-[inset_4px_0_0_0] shadow-indigo-500"
      )}
    >
      <div className="shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <p className={cn(
            "text-sm font-semibold",
            notification.is_read ? "text-slate-700" : "text-foreground"
          )}>
            {notification.title}
          </p>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap shrink-0 ml-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className={cn(
          "text-sm leading-snug",
          notification.is_read ? "text-muted-foreground" : "text-slate-700"
        )}>
          {notification.message}
        </p>
        {notification.link && (
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            View details <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}
