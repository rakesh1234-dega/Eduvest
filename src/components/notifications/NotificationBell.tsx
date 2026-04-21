import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationPanel } from "./NotificationPanel";
import { useUnreadNotifications } from "@/hooks/notifications/useUnreadNotifications";
import { useState } from "react";

export function NotificationBell() {
  const { data: unreadCount } = useUnreadNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors focus:outline-none">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount && unreadCount > 0 ? (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 border-none shadow-none w-auto bg-transparent mt-2">
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
