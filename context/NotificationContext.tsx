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

type NotificationContextType = {
  notifications: NotificationType[];
  notify: (
    title: string,
    message: string,
    type: "success" | "error" | "info",
  ) => void;
  loadNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotification = () =>
  useContext(NotificationContext) as NotificationContextType;

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authLoading } = useAuth();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  //   const [notificationsLoading, setNotificationsLoading] =
  //     useState<boolean>(true);
  const notificationsLoading = useRef<boolean>(false);

  const fetchApi = useApi();

  const isInitialized = useRef(false);

  // notify function to add a new notification
  const notify = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setNotifications((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const loadNotifications = useCallback(async () => {
    if (authLoading || !user?.user_id || notificationsLoading.current) return;

    notificationsLoading.current = true;

    try {
      const data: { success: boolean; data: NotificationType[] } =
        await fetchApi(`/api/protected/notification?user_id=${user?.user_id}`);

      setNotifications(data.data || []);
    } finally {
      notificationsLoading.current = false;
    }
  }, [authLoading, fetchApi, user?.user_id]);

  useEffect(() => {
    if (authLoading || !user?.user_id || isInitialized.current) return;

    isInitialized.current = true;

    // schedule async call to avoid sync setState inside effect which can
    // cause cascading renders
    const id = setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => clearTimeout(id);
  }, [authLoading, user?.user_id, loadNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, loadNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
