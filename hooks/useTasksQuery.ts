"use client";

import { useApi } from "@/utilities/api";
import TaskType from "@/lib/types/task";
import { useCallback, useState } from "react";

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

export function useTasksQuery() {
  const fetchApi = useApi();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [pagination, setPagination] = useState<Pagination>(DEFAULT_PAGINATION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (params: TasksQueryParams) => {
      setIsLoading(true);
      setError(null);

      try {
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

        const data: TasksQueryResponse = await fetchApi(
          `/api/protected/tasks?${query.toString()}`,
        );

        if (!data.success) throw new Error("Unable to fetch tasks");

        setTasks(data.data || []);
        setPagination(data.pagination || DEFAULT_PAGINATION);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to fetch tasks");
      } finally {
        setIsLoading(false);
      }
    },
    [fetchApi],
  );

  return { tasks, pagination, isLoading, error, fetchTasks };
}
