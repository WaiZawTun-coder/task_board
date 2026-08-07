"use client";

import TaskType from "@/lib/types/task";
import { queryKeys } from "@/lib/query-keys";
import { useApi } from "@/utilities/api";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { TasksQueryResponse } from "@/hooks/queries/useTasksQuery";
import { DashboardData } from "@/hooks/queries/useDashboardQuery";

type TaskContextType = {
  createTask: (data: {
    title: string;
    description?: string;
    due?: Date;
    project_id?: number;
  }) => Promise<{ success: boolean; message?: string }>;
  updateTask: (data: {
    task_id: number;
    title: string;
    description: string;
    due: Date;
    status: "pending" | "on_going" | "cancel" | "completed";
    priority: "low" | "medium" | "high";
  }) => Promise<{ success: boolean }>;
  deleteTask: (data: {
    task_id: number;
  }) => Promise<{ success: boolean; message?: string }>;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const useTask = () => useContext(TaskContext) as TaskContextType;

type TaskStatus = TaskType["status"];

// Dashboard columns are capped at 5 visible tasks (see task-column.tsx),
// so a task being edited may not be in the cached board at all — that's
// fine, we just skip the optimistic patch and let the background
// invalidation below reconcile it.
function findTaskStatus(
  dashboard: DashboardData,
  taskId: number,
): TaskStatus | null {
  const statuses = Object.keys(dashboard.columns) as TaskStatus[];
  for (const status of statuses) {
    if (dashboard.columns[status].some((t) => t.task_id === taskId)) {
      return status;
    }
  }
  return null;
}

// today / calendar / analytics depend on server-side date bucketing
// (CURRENT_DATE comparisons, 14-day trend windows) that's not worth
// re-implementing client-side — invalidate those in the background
// instead of trying to patch them optimistically.
const invalidateDateDependentQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.today });
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
};

// Safety-net reconciliation with the server — runs *after* the
// optimistic patch already updated the screen, so the user never waits
// on this.
const reconcileTaskCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: ["tasks"] });
  queryClient.invalidateQueries({ queryKey: ["task"] });
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const fetchApi = useApi();
  const queryClient = useQueryClient();

  const createTask: TaskContextType["createTask"] = async ({
    title,
    description,
    due,
    project_id,
  }) => {
    const data: { success: boolean; data: TaskType } = await fetchApi(
      "/api/protected/task",
      { method: "POST", body: { title, description, due, project_id } },
    );

    if (!data.data?.task_id) throw new Error("Invalid task_id returned");

    // No optimistic add here — where a brand-new task lands in a sorted,
    // paginated list depends on server-side ordering we don't want to
    // guess at, so just invalidate everything it could affect.
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task"] });
    invalidateDateDependentQueries(queryClient);

    return data;
  };

  const updateTask: TaskContextType["updateTask"] = async (payload) => {
    const previousDashboard = queryClient.getQueryData<DashboardData>(
      queryKeys.dashboard,
    );
    const previousTasksQueries = queryClient.getQueriesData<TasksQueryResponse>(
      {
        queryKey: ["tasks"],
      },
    );

    const applyPatch = (task: TaskType): TaskType => ({
      ...task,
      title: payload.title,
      description: payload.description,
      due: payload.due,
      status: payload.status,
      priority: payload.priority,
    });

    // Optimistically move/patch the task on the dashboard board.
    queryClient.setQueryData<DashboardData>(queryKeys.dashboard, (current) => {
      if (!current) return current;

      const previousStatus = findTaskStatus(current, payload.task_id);
      if (!previousStatus) return current;

      const existing = current.columns[previousStatus].find(
        (t) => t.task_id === payload.task_id,
      )!;
      const updatedTask = applyPatch(existing);

      if (previousStatus === payload.status) {
        return {
          ...current,
          columns: {
            ...current.columns,
            [previousStatus]: current.columns[previousStatus].map((t) =>
              t.task_id === payload.task_id ? updatedTask : t,
            ),
          },
          upcoming: current.upcoming.map((t) =>
            t.task_id === payload.task_id ? updatedTask : t,
          ),
          recent: current.recent.map((t) =>
            t.task_id === payload.task_id ? updatedTask : t,
          ),
        };
      }

      const sourceTasks = current.columns[previousStatus].filter(
        (t) => t.task_id !== payload.task_id,
      );
      const targetTasks = [
        updatedTask,
        ...current.columns[payload.status].filter(
          (t) => t.task_id !== payload.task_id,
        ),
      ].slice(0, 5);

      return {
        ...current,
        columns: {
          ...current.columns,
          [previousStatus]: sourceTasks,
          [payload.status]: targetTasks,
        },
        counts: {
          ...current.counts,
          [previousStatus]: Math.max(0, current.counts[previousStatus] - 1),
          [payload.status]: current.counts[payload.status] + 1,
        },
        upcoming:
          payload.status === "cancel"
            ? current.upcoming.filter((t) => t.task_id !== payload.task_id)
            : current.upcoming.map((t) =>
                t.task_id === payload.task_id ? updatedTask : t,
              ),
        recent: current.recent.map((t) =>
          t.task_id === payload.task_id ? updatedTask : t,
        ),
      };
    });

    // Optimistically patch every cached tasks-list page containing this task.
    queryClient.setQueriesData<TasksQueryResponse>(
      { queryKey: ["tasks"] },
      (current) => {
        if (!current) return current;
        return {
          ...current,
          data: current.data.map((t) =>
            t.task_id === payload.task_id ? applyPatch(t) : t,
          ),
        };
      },
    );

    try {
      const data: { success: boolean } = await fetchApi("/api/protected/task", {
        method: "PUT",
        body: { ...payload, user_id: user?.user_id },
      });

      if (!data.success) {
        queryClient.setQueryData(queryKeys.dashboard, previousDashboard);
        previousTasksQueries.forEach(([key, value]) =>
          queryClient.setQueryData(key, value),
        );
      }

      invalidateDateDependentQueries(queryClient);
      reconcileTaskCaches(queryClient);

      return data;
    } catch (err: unknown) {
      queryClient.setQueryData(queryKeys.dashboard, previousDashboard);
      previousTasksQueries.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
      throw err;
    }
  };

  const deleteTask: TaskContextType["deleteTask"] = async ({ task_id }) => {
    if (!user?.user_id) return { success: false };

    const previousDashboard = queryClient.getQueryData<DashboardData>(
      queryKeys.dashboard,
    );
    const previousTasksQueries = queryClient.getQueriesData<TasksQueryResponse>(
      {
        queryKey: ["tasks"],
      },
    );

    queryClient.setQueryData<DashboardData>(queryKeys.dashboard, (current) => {
      if (!current) return current;

      const status = findTaskStatus(current, task_id);
      if (!status) return current;

      return {
        ...current,
        columns: {
          ...current.columns,
          [status]: current.columns[status].filter(
            (t) => t.task_id !== task_id,
          ),
        },
        counts: {
          ...current.counts,
          [status]: Math.max(0, current.counts[status] - 1),
        },
        stats: {
          ...current.stats,
          total: Math.max(0, current.stats.total - 1),
        },
        upcoming: current.upcoming.filter((t) => t.task_id !== task_id),
        recent: current.recent.filter((t) => t.task_id !== task_id),
      };
    });

    queryClient.setQueriesData<TasksQueryResponse>(
      { queryKey: ["tasks"] },
      (current) => {
        if (!current) return current;
        if (!current.data.some((t) => t.task_id === task_id)) return current;

        return {
          ...current,
          data: current.data.filter((t) => t.task_id !== task_id),
          pagination: {
            ...current.pagination,
            total: Math.max(0, current.pagination.total - 1),
          },
        };
      },
    );

    try {
      const data: { success: boolean; message?: string } = await fetchApi(
        "/api/protected/task",
        { method: "DELETE", body: { task_id } },
      );

      if (!data.success) {
        queryClient.setQueryData(queryKeys.dashboard, previousDashboard);
        previousTasksQueries.forEach(([key, value]) =>
          queryClient.setQueryData(key, value),
        );
      }

      invalidateDateDependentQueries(queryClient);
      reconcileTaskCaches(queryClient);

      return data;
    } catch (err: unknown) {
      queryClient.setQueryData(queryKeys.dashboard, previousDashboard);
      previousTasksQueries.forEach(([key, value]) =>
        queryClient.setQueryData(key, value),
      );
      throw err;
    }
  };

  return (
    <TaskContext.Provider value={{ createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
