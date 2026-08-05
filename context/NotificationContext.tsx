"use client";

import NotificationType from "@/lib/types/notification";
import { useApi } from "@/utilities/api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

const RECENT_LIMIT = 10;
const POLL_INTERVAL_MS = 60_000;

type NotificationContextType = {
  notifications: NotificationType[];
  unreadCount: number;
  isLoading: boolean;
  notify: (
    title: string,
    message: string,
    type: "success" | "error" | "info",
  ) => void;
  loadNotifications: () => void;
  markAsRead: (
    notification: NotificationType,
  ) => Promise<{ success: boolean; message?: string }>;
  markAllAsRead: () => Promise<{ success: boolean; message?: string }>;
  deleteNotification: (
    notification: NotificationType,
  ) => Promise<{ success: boolean; message?: string }>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () =>
  useContext(NotificationContext) as NotificationContextType;

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const notificationsLoading = useRef<boolean>(false);

  const fetchApi = useApi();

  const isInitialized = useRef(false);

  // adds a local, ephemeral entry (not persisted to the database) — used
  // for instant feedback like "Profile updated". Shown in the bell
  // dropdown alongside server notifications until the next
  // loadNotifications() refresh replaces the list.
  const notify = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setNotifications((prev) => [
      {
        id: crypto.randomUUID(),
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const loadNotifications = useCallback(async () => {
    if (notificationsLoading.current) return;

    notificationsLoading.current = true;
    setIsLoading(true);

    try {
      const data: {
        success: boolean;
        data: NotificationType[];
        unreadCount: number;
      } = await fetchApi(`/api/protected/notification?limit=${RECENT_LIMIT}`);

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } finally {
      notificationsLoading.current = false;
      setIsLoading(false);
    }
  }, [fetchApi]);

  const markAsRead = async (
    notification: NotificationType,
  ): Promise<{ success: boolean; message?: string }> => {
    // ephemeral, client-only notifications never reached the database
    if (!notification.notification_id) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      return { success: true };
    }

    if (notification.is_read) return { success: true };

    const previous = notifications;
    const previousUnread = unreadCount;

    setNotifications((prev) =>
      prev.map((n) =>
        n.notification_id === notification.notification_id
          ? { ...n, is_read: true }
          : n,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const data: { success: boolean; message?: string } = await fetchApi(
        "/api/protected/notification",
        {
          method: "PUT",
          body: { notificationId: notification.notification_id },
        },
      );

      if (!data.success) {
        setNotifications(previous);
        setUnreadCount(previousUnread);
      }

      return data;
    } catch (err: unknown) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      throw err;
    }
  };

  const markAllAsRead = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    const previous = notifications;
    const previousUnread = unreadCount;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const data: { success: boolean; message?: string } = await fetchApi(
        "/api/protected/notification",
        { method: "PUT", body: { markAll: true } },
      );

      if (!data.success) {
        setNotifications(previous);
        setUnreadCount(previousUnread);
      }

      return data;
    } catch (err: unknown) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      throw err;
    }
  };

  const deleteNotification = async (
    notification: NotificationType,
  ): Promise<{ success: boolean; message?: string }> => {
    const previous = notifications;
    const previousUnread = unreadCount;

    setNotifications((prev) =>
      prev.filter((n) =>
        notification.notification_id
          ? n.notification_id !== notification.notification_id
          : n.id !== notification.id,
      ),
    );
    if (!notification.is_read) setUnreadCount((prev) => Math.max(0, prev - 1));

    if (!notification.notification_id) return { success: true };

    try {
      const data: { success: boolean; message?: string } = await fetchApi(
        "/api/protected/notification",
        {
          method: "DELETE",
          body: { notificationId: notification.notification_id },
        },
      );

      if (!data.success) {
        setNotifications(previous);
        setUnreadCount(previousUnread);
      }

      return data;
    } catch (err: unknown) {
      setNotifications(previous);
      setUnreadCount(previousUnread);
      throw err;
    }
  };

  useEffect(() => {
    if (isInitialized.current) return;

    isInitialized.current = true;

    const id = setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => clearTimeout(id);
  }, [loadNotifications]);

  // periodic refresh so DB-side automation (triggers / scheduled jobs)
  // shows up without requiring a client-side task mutation first
  useEffect(() => {
    const interval = setInterval(() => {
      void loadNotifications();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        notify,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
