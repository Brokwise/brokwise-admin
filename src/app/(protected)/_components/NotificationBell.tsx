"use client";

import React, { useState } from "react";
import {
  Bell,
  Users,
  Building2,
  MessageCircle,
  CreditCard,
  Calendar,
  MessageSquare,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useAdminUnreadCount,
  useAdminNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  AdminNotification,
} from "@/hooks/useAdminNotifications";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { resolveAdminNotificationRoute } from "@/lib/adminNotificationRoute";

const categoryIcons: Record<string, React.ReactNode> = {
  USER_MANAGEMENT: <Users className="h-4 w-4 text-blue-500" />,
  PROPERTY: <Building2 className="h-4 w-4 text-green-500" />,
  ENQUIRY: <MessageCircle className="h-4 w-4 text-orange-500" />,
  PAYMENT: <CreditCard className="h-4 w-4 text-purple-500" />,
  BOOKING: <Calendar className="h-4 w-4 text-teal-500" />,
  MESSAGING: <MessageSquare className="h-4 w-4 text-indigo-500" />,
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { unreadCount } = useAdminUnreadCount();
  const { data } = useAdminNotifications({ limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.read) {
      markRead.mutate(notification._id);
    }
    const targetRoute = resolveAdminNotificationRoute(notification);
    if (targetRoute) {
      router.push(targetRoute);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllRead.mutate(undefined)}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {data?.notifications && data.notifications.length > 0 ? (
            data.notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex cursor-pointer gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50 ${
                  !notification.read ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  {categoryIcons[notification.category] || (
                    <Bell className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm ${!notification.read ? "font-semibold" : ""}`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-normal break-words">
                    {notification.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!notification.read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              router.push("/notifications");
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
