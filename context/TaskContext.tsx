"use client";

import TaskType from "@/lib/types/task";
import { queryKeys } from "@/lib/query-keys";
import { useApi } from "@/utilities/api";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";

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

// Every mutation touches these — a task can affect the board, today's
// list, the calendar grid, and analytics all at once.
const invalidateTaskAffectedQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: queryKeys.today });
  queryClient.invalidateQueries({ queryKey: ["tasks"] }); // matches any params
  queryClient.invalidateQueries({ queryKey: ["calendar"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
};

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading } = useAuth();
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

    invalidateTaskAffectedQueries(queryClient);
    return data;
  };

  const updateTask: TaskContextType["updateTask"] = async (payload) => {
    if (authLoading || !user?.user_id) return { success: false };

    const data: { success: boolean } = await fetchApi("/api/protected/task", {
      method: "PUT",
      body: { ...payload, user_id: user.user_id },
    });

    if (data.success) invalidateTaskAffectedQueries(queryClient);
    return data;
  };

  const deleteTask: TaskContextType["deleteTask"] = async ({ task_id }) => {
    if (authLoading || !user?.user_id) return { success: false };

    const data: { success: boolean; message?: string } = await fetchApi(
      "/api/protected/task",
      { method: "DELETE", body: { task_id } },
    );

    if (data.success) invalidateTaskAffectedQueries(queryClient);
    return data;
  };

  return (
    <TaskContext.Provider value={{ createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
