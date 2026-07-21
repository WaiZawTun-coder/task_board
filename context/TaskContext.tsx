"use client";

import TaskType from "@/lib/types/task";
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

type TaskContextType = {
  tasks: TaskType[];
  createTask: ({
    title,
    description,
    due,
  }: {
    title: string;
    description?: string;
    due?: Date;
  }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  updateTask: ({
    task_id,
    title,
    description,
    due,
    status,
    priority,
  }: {
    task_id: number;
    title: string;
    description: string;
    due: Date;
    status: "pending" | "on_going" | "cancel";
    priority: "low" | "medium" | "high";
  }) => Promise<{ success: boolean }>;
};

const TaskContext = createContext<TaskContextType | null>(null);

export const useTask = () => useContext(TaskContext) as TaskContextType;

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const { user, authLoading } = useAuth();
  const taskLoading = useRef<boolean>(false);

  const fetchApi = useApi();

  const isInitialized = useRef<boolean>(false);

  const loadTasks = useCallback(async () => {
    if (authLoading || !user?.user_id) {
      return;
    }

    // set loading flag true at start
    taskLoading.current = true;

    // get logged in user id
    const user_id = user.user_id;

    try {
      // get date from api
      const data: { success: boolean; data: TaskType[] } = await fetchApi(
        `/api/protected/tasks?user_id=${user_id}`,
      );

      setTasks(data.data || []);
    } catch (err: unknown) {
      throw err;
    } finally {
      // set loading flag false on finish
      taskLoading.current = false;
    }
  }, [authLoading, user?.user_id, fetchApi]);

  const createTask = async ({
    title,
    description,
    due,
  }: {
    title: string;
    description?: string;
    due?: Date;
  }): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      const body = { title, description, due, user_id: user?.user_id };

      const data: { success: boolean; message: string } = await fetchApi(
        "/api/protected/task",
        {
          method: "POST",
          body,
        },
      );

      return data;
      // return { success: true, message: "Update this" };
    } catch (err: unknown) {
      throw err;
    }
  };

  const updateTask = async ({
    task_id,
    title,
    description,
    due,
    status,
    priority,
  }: {
    task_id: number;
    title: string;
    description: string;
    due: Date;
    status: "pending" | "on_going" | "cancel";
    priority: "low" | "medium" | "high";
  }): Promise<{ success: boolean }> => {
    if (authLoading || !user?.user_id || !isInitialized.current)
      return { success: false };

    try {
      const body = {
        task_id,
        title,
        description,
        due,
        status,
        priority,
        user_id: user.user_id,
      };

      const data: { success: boolean } = await fetchApi(`/api/protected/task`, {
        method: "PUT",
        body,
      });

      return data;
    } catch (err: unknown) {
      throw err;
    }
  };

  useEffect(() => {
    if (authLoading || !user?.user_id || isInitialized.current) return;

    isInitialized.current = true;

    const id = setTimeout(() => {
      void loadTasks();
    }, 0);

    return () => clearTimeout(id);
  }, [authLoading, user?.user_id, loadTasks]);

  return (
    <TaskContext.Provider value={{ tasks, createTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
};
