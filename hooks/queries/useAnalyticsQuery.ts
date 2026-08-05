"use client";

import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import { AnalyticsData } from "@/lib/types/analytics";
import { useApi } from "@/utilities/api";
import { useQuery } from "@tanstack/react-query";

const EMPTY_ANALYTICS: AnalyticsData = {
  overview: { total: 0, completed: 0, overdue: 0, completionRate: 0 },
  statusBreakdown: { pending: 0, on_going: 0, cancel: 0, completed: 0 },
  priorityBreakdown: { low: 0, medium: 0, high: 0 },
  projectBreakdown: [],
  creationTrend: [],
};

export function useAnalyticsQuery() {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const query = useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () =>
      (
        await fetchApi<{ success: boolean; data: AnalyticsData }>(
          "/api/protected/analytics",
        )
      ).data,
    enabled: !authLoading && !!user?.user_id,
  });

  return {
    analytics: query.data ?? EMPTY_ANALYTICS,
    isLoading: query.isLoading,
    refreshAnalytics: query.refetch,
  };
}
