import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/notifications/notification-service";
import { useUser } from "@clerk/clerk-react";

export function useNotifications() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error("No user found");
      return notificationService.getNotifications(user.id);
    },
    enabled: !!user?.id,
    staleTime: 0, // 🔄 Ensure the tray is always fresh
    refetchOnWindowFocus: true,
  });

  const markAsRead = useMutation({
    mutationFn: (notificationId: string) => {
      if (!user?.id) throw new Error("No user found");
      return notificationService.markAsRead(user.id, notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications", user?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("No user found");
      return notificationService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotifications", user?.id] });
    },
  });

  return {
    ...query,
    markAsRead,
    markAllAsRead,
  };
}
