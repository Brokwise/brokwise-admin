import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "./use-axios";

export interface AdminNotification {
  _id: string;
  type: string;
  category: "USER_MANAGEMENT" | "PROPERTY" | "ENQUIRY" | "PAYMENT" | "BOOKING";
  title: string;
  description: string;
  relatedId?: string;
  relatedModel?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationsResponse {
  notifications: AdminNotification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
}

export const useAdminNotifications = (options?: {
  page?: number;
  limit?: number;
  category?: string;
  read?: string;
}) => {
  const api = useAxios();

  const params = new URLSearchParams();
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.category) params.set("category", options.category);
  if (options?.read) params.set("read", options.read);

  const { data, isLoading, error } = useQuery<NotificationsResponse>({
    queryKey: ["adminNotifications", options],
    queryFn: async () =>
      (await api.get(`/admin/notifications?${params.toString()}`)).data.data,
    refetchInterval: 30000,
  });

  return { data, isLoading, error };
};

export const useAdminUnreadCount = () => {
  const api = useAxios();

  const { data, isLoading } = useQuery<{ unreadCount: number }>({
    queryKey: ["adminNotificationsUnreadCount"],
    queryFn: async () =>
      (await api.get("/admin/notifications/unread-count")).data.data,
    refetchInterval: 30000,
  });

  return { unreadCount: data?.unreadCount || 0, isLoading };
};

export const useMarkNotificationRead = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.patch(`/admin/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      queryClient.invalidateQueries({
        queryKey: ["adminNotificationsUnreadCount"],
      });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const api = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category?: string) => {
      return await api.patch("/admin/notifications/mark-all-read", {
        category,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminNotifications"] });
      queryClient.invalidateQueries({
        queryKey: ["adminNotificationsUnreadCount"],
      });
    },
  });
};
