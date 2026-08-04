"use client";

import { useApi } from "@/utilities/api";
import NotificationType from "@/lib/types/notification";
import { useCallback, useState } from "react";

export type NotificationsQueryParams = {
  status?: "all" | "unread" | "read";
  type?: NotificationType["type"];
  page?: number;
  limit?: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type NotificationsQueryResponse = {
  success: boolean;
  data: NotificationType[];
  unreadCount: number;
  pagination: Pagination;
};

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function useNotificationsQuery() {
  const fetchApi = useApi();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (params: NotificationsQueryParams) => {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();

        if (params.status && params.status !== "all")
          query.set("status", params.status);
        if (params.type) query.set("type", params.type);
        query.set("page", String(params.page ?? 1));
        query.set("limit", String(params.limit ?? 10));

        const data: NotificationsQueryResponse = await fetchApi(
          `/api/protected/notification?${query.toString()}`,
        );

        if (!data.success) throw new Error("Unable to fetch notifications");

        setNotifications(data.data || []);
        setPagination(data.pagination || DEFAULT_PAGINATION);
        setUnreadCount(data.unreadCount ?? 0);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Unable to fetch notifications",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchApi],
  );

  return {
    notifications,
    pagination,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
  };
}
