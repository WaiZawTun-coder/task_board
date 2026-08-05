"use client";

import { queryKeys } from "@/lib/query-keys";
import TaskType from "@/lib/types/task";
import { useApi } from "@/utilities/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

type TaskStatus = TaskType["status"];

type DashboardData = {
  columns: Record<TaskStatus, TaskType[]>;
  counts: Record<TaskStatus, number>;
  stats: { total: number; overdue: number };
  upcoming: TaskType[];
  recent: TaskType[];
  projectCounts: Record<string, number>;
};

const EMPTY_DASHBOARD: DashboardData = {
  columns: { pending: [], on_going: [], cancel: [], completed: [] },
  counts: { pending: 0, on_going: 0, cancel: 0, completed: 0 },
  stats: { total: 0, overdue: 0 },
  upcoming: [],
  recent: [],
  projectCounts: {},
};

export function useDashboardQuery() {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const query = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () =>
      (
        await fetchApi<{ success: boolean; data: DashboardData }>(
          "/api/protected/dashboard",
        )
      ).data,
    enabled: !authLoading && !!user?.user_id,
  });

  return {
    dashboard: query.data ?? EMPTY_DASHBOARD,
    isLoading: query.isLoading,
  };
}
