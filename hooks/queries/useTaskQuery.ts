"use client";

import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/query-keys";
import TaskType from "@/lib/types/task";
import { useApi } from "@/utilities/api";
import { useQuery } from "@tanstack/react-query";

export type TaskQueryParams = {
  taskId: number;
};

type TaskQueryResponse = {
  success: boolean;
  data: TaskType;
};

export function useTaskQuery({ taskId }: TaskQueryParams) {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const isValidId = Number.isInteger(taskId) && taskId > 0;

  const query = useQuery({
    queryKey: queryKeys.task(taskId),
    queryFn: async () =>
      (
        await fetchApi<TaskQueryResponse>(
          `/api/protected/task?task_id=${taskId}`,
        )
      ).data,
    enabled: !authLoading && !!user?.user_id && isValidId,
  });

  return {
    task: query.data ?? null,
    notFound: !isValidId || query.isError,
    isLoading: query.isLoading,
    error: query.isError ? "Unable to fetch task" : null,
    refetch: query.refetch,
  };
}
