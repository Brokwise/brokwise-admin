"use client";

import React, { useState } from "react";
import {
  Bell,
  Users,
  Building2,
  MessageCircle,
  CreditCard,
  Calendar,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useAdminNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  AdminNotification,
} from "@/hooks/useAdminNotifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const categories = [
  { key: undefined, label: "All" },
  { key: "USER_MANAGEMENT", label: "Users" },
  { key: "PROPERTY", label: "Properties" },
  { key: "ENQUIRY", label: "Enquiries" },
  { key: "PAYMENT", label: "Payments" },
  { key: "BOOKING", label: "Bookings" },
] as const;

const categoryIcons: Record<string, React.ReactNode> = {
  USER_MANAGEMENT: <Users className="h-4 w-4 text-blue-500" />,
  PROPERTY: <Building2 className="h-4 w-4 text-green-500" />,
  ENQUIRY: <MessageCircle className="h-4 w-4 text-orange-500" />,
  PAYMENT: <CreditCard className="h-4 w-4 text-purple-500" />,
  BOOKING: <Calendar className="h-4 w-4 text-teal-500" />,
};

const NotificationsPage = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminNotifications({
    page,
    limit: 20,
    category: selectedCategory,
  });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.read) {
      markRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {data && data.unreadCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.unreadCount} unread notification
              {data.unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {data && data.unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate(selectedCategory)}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.label}
            variant={selectedCategory === cat.key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setSelectedCategory(cat.key);
              setPage(1);
            }}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : data?.notifications && data.notifications.length > 0 ? (
          data.notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex cursor-pointer gap-4 border-b px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/50 ${
                !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                {categoryIcons[notification.category] || (
                  <Bell className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-sm ${!notification.read ? "font-semibold" : ""}`}
                    >
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {notification.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="mb-2 h-8 w-8" />
            <p className="text-sm">No notifications found</p>
          </div>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
