import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/lib/notifications/notification-service";
import { useUser } from "@clerk/clerk-react";

export function useUnreadNotifications() {
  const { user } = useUser();

  const query = useQuery({
    queryKey: ["unreadNotifications", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("No user found");
      return notificationService.getUnreadCount(user.id);
    },
    enabled: !!user?.id,
  });

  return query;
}
