"use client";

import { cn } from "@/lib/utils";
import NotificationType from "@/lib/types/notification";

type NotificationCardProps = {
  notification: NotificationType;
  onClick?: () => void;
};

const dotClassByType: Record<NotificationType["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  error: "bg-red-500",
};

const NotificationCard = ({ notification, onClick }: NotificationCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-0.5 rounded-md p-2 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
        !notification.is_read && "bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-medium">{notification.title}</h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {new Date(notification.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="truncate text-xs text-muted-foreground">
        {notification.message}
      </p>
      {!notification.is_read && (
        <span
          className={cn(
            "mt-0.5 inline-block h-2 w-2 rounded-full",
            dotClassByType[notification.type],
          )}
        />
      )}
    </button>
  );
};

export default NotificationCard;
