"use client";

import { queryKeys } from "@/lib/query-keys";
import TaskType from "@/lib/types/task";
import { useApi } from "@/utilities/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

type TodayStats = {
  today_total: number;
  today_completed: number;
  overdue_total: number;
};

type TodayResponse = {
  success: boolean;
  data: { today: TaskType[]; overdue: TaskType[]; stats: TodayStats };
};

const EMPTY_STATS: TodayStats = {
  today_total: 0,
  today_completed: 0,
  overdue_total: 0,
};

export function useTodayQuery() {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const query = useQuery({
    queryKey: queryKeys.today,
    queryFn: () => fetchApi<TodayResponse>("/api/protected/today"),
    enabled: !authLoading && !!user?.user_id,
  });

  const today = query.data?.data.today ?? [];
  const overdue = query.data?.data.overdue ?? [];
  const stats = query.data?.data.stats ?? EMPTY_STATS;
  const actionableCount =
    stats.overdue_total +
    Math.max(0, stats.today_total - stats.today_completed);

  return {
    today,
    overdue,
    stats,
    actionableCount,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
