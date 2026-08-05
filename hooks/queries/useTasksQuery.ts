"use client";

import { queryKeys } from "@/lib/query-keys";
import TaskType from "@/lib/types/task";
import { useApi } from "@/utilities/api";
import { useAuth } from "@/context/AuthContext";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type TasksQueryParams = {
  search?: string;
  status?: string;
  priorities?: TaskType["priority"][];
  project_id?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TasksQueryResponse = {
  success: boolean;
  data: TaskType[];
  pagination: Pagination;
};

const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

// Normalizes params into a stable, serializable shape so the query key
// doesn't change on every render (e.g. an empty array vs undefined).
const buildQueryString = (params: TasksQueryParams) => {
  const query = new URLSearchParams();

  if (params.search) query.set("search", params.search);
  if (params.status && params.status !== "all")
    query.set("status", params.status);
  if (params.priorities?.length)
    query.set("priorities", params.priorities.join(","));
  if (params.project_id !== undefined)
    query.set("project_id", String(params.project_id));
  if (params.sort) query.set("sort", params.sort);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 10));

  return query.toString();
};

export function useTasksQuery(params: TasksQueryParams) {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const query = useQuery({
    queryKey: queryKeys.tasks(params as Record<string, unknown>),
    queryFn: () =>
      fetchApi<TasksQueryResponse>(
        `/api/protected/tasks?${buildQueryString(params)}`,
      ),
    enabled: !authLoading && !!user?.user_id,
    placeholderData: keepPreviousData,
  });

  return {
    tasks: query.data?.data ?? [],
    pagination: query.data?.pagination ?? DEFAULT_PAGINATION,
    isLoading: query.isLoading,
    isFetching: query.isFetching, // background refetch while showing stale page
    error: query.isError ? "Unable to fetch tasks" : null,
  };
}
