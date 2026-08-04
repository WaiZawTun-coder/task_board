"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  MailCheck,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/UI/button";
import {
  NotificationFilters,
  ReadFilter,
  TypeFilter,
} from "@/components/notifications/notification-filters";
import { NotificationListItem } from "@/components/notifications/notification-list-item";
import { useNotification } from "@/context/NotificationContext";
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery";
import { useApi } from "@/utilities/api";
import NotificationType from "@/lib/types/notification";

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const { markAsRead, markAllAsRead, deleteNotification, loadNotifications } =
    useNotification();
  const fetchApi = useApi();

  const {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    fetchNotifications,
  } = useNotificationsQuery();

  const [status, setStatus] = useState<ReadFilter>("all");
  const [type, setType] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [status, type]);

  const runQuery = () =>
    fetchNotifications({
      status,
      type: type === "all" ? undefined : type,
      page,
      limit: PAGE_SIZE,
    });

  useEffect(() => {
    void runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, page]);

  const refreshAll = async () => {
    await Promise.all([runQuery(), loadNotifications()]);
  };

  const handleMarkAsRead = async (notification: NotificationType) => {
    try {
      await markAsRead(notification);
      await runQuery();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleDelete = async (notification: NotificationType) => {
    try {
      await deleteNotification(notification);
      await runQuery();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await runQuery();
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const handleClearRead = async () => {
    try {
      await fetchApi<{ success: boolean }>("/api/protected/notification", {
        method: "DELETE",
        body: { clearRead: true },
      });
      await refreshAll();
    } catch (err) {
      console.error("Failed to clear read notifications", err);
    }
  };

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : `${unreadCount} unread of ${pagination.total} total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <MailCheck className="h-4 w-4" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={handleClearRead}>
            <Trash2 className="h-4 w-4" />
            Clear read
          </Button>
        </div>
      </div>

      <NotificationFilters
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
      />

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">No notifications</p>
          <p className="text-xs text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationListItem
              key={notification.notification_id ?? notification.id}
              notification={notification}
              onMarkAsRead={() => handleMarkAsRead(notification)}
              onDelete={() => handleDelete(notification)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
