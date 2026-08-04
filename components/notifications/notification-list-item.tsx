"use client";

import { format } from "date-fns";
import {
  CheckCircle2,
  Info,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/UI/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { cn } from "@/lib/utils";
import NotificationType from "@/lib/types/notification";

const typeConfig: Record<
  NotificationType["type"],
  { label: string; className: string; icon: typeof Info }
> = {
  info: {
    label: "Info",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    icon: Info,
  },
  success: {
    label: "Success",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
    icon: CheckCircle2,
  },
  error: {
    label: "Error",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
    icon: XCircle,
  },
};

type NotificationListItemProps = {
  notification: NotificationType;
  onMarkAsRead: () => void;
  onDelete: () => void;
};

export function NotificationListItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationListItemProps) {
  const { label, className, icon: Icon } = typeConfig[notification.type];
  const createdAt = new Date(notification.created_at);
  const hasValidDate = !Number.isNaN(createdAt.getTime());

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border bg-background p-3",
        !notification.is_read && "border-primary/30 bg-primary/5",
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          className,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "truncate text-sm",
              notification.is_read ? "font-normal" : "font-medium",
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {notification.message}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge className={cn("border-none", className)}>{label}</Badge>
          {hasValidDate && (
            <span className="text-xs text-muted-foreground">
              {format(createdAt, "MMM d, h:mm a")}
            </span>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="shrink-0 cursor-pointer text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!notification.is_read && (
            <DropdownMenuItem onClick={onMarkAsRead}>
              <CheckCircle2 className="h-4 w-4" /> Mark as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
