"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "../UI/badge";
import { buttonVariants } from "../UI/button";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
import { useNotification } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";
import NotificationCard from "../notifications/notification-card";

const NotificationHeader = () => {
  const { notifications, unreadCount, loadNotifications, markAsRead } =
    useNotification();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <Popover>
      <PopoverTrigger className="relative" aria-label="notification">
        <Bell className="cursor-pointer" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-2 -top-2 h-4 min-w-4 justify-center rounded-full border-none px-1 text-[10px]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-sm p-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">Notifications</p>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="mt-2 flex max-h-80 flex-col gap-1 overflow-y-auto">
          {notifications.length === 0 && (
            <p className="px-1 py-3 text-center text-sm text-muted-foreground">
              No notifications
            </p>
          )}
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.notification_id ?? notification.id}
              notification={notification}
              onClick={() => {
                if (!notification.is_read) void markAsRead(notification);
              }}
            />
          ))}
        </div>
        <Link
          href="/notifications"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "mt-2 w-full justify-center",
          )}
        >
          View all notifications
        </Link>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationHeader;
