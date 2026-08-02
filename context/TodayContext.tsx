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

type TodayStats = {
  today_total: number;
  today_completed: number;
  overdue_total: number;
};

type TodayContextType = {
  today: TaskType[];
  overdue: TaskType[];
  stats: TodayStats;
  // Tasks that still need attention: everything overdue plus anything due
  // today that isn't completed yet. Used for the sidebar badge.
  actionableCount: number;
  isLoading: boolean;
  refreshToday: () => Promise<void>;
};

const EMPTY_STATS: TodayStats = {
  today_total: 0,
  today_completed: 0,
  overdue_total: 0,
};

const TodayContext = createContext<TodayContextType | null>(null);

export const useToday = () => useContext(TodayContext) as TodayContextType;

export const TodayProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const [today, setToday] = useState<TaskType[]>([]);
  const [overdue, setOverdue] = useState<TaskType[]>([]);
  const [stats, setStats] = useState<TodayStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const todayLoading = useRef<boolean>(false);
  const isInitialized = useRef(false);

  const refreshToday = useCallback(async () => {
    if (authLoading || !user?.user_id || todayLoading.current) return;

    todayLoading.current = true;
    setIsLoading(true);

    try {
      const data: {
        success: boolean;
        data: { today: TaskType[]; overdue: TaskType[]; stats: TodayStats };
      } = await fetchApi("/api/protected/today");

      if (data.success) {
        setToday(data.data.today || []);
        setOverdue(data.data.overdue || []);
        setStats(data.data.stats || EMPTY_STATS);
      }
    } finally {
      todayLoading.current = false;
      setIsLoading(false);
    }
  }, [authLoading, fetchApi, user?.user_id]);

  // initial load, deferred to a microtask to avoid sync setState inside effect
  useEffect(() => {
    if (authLoading || !user?.user_id || isInitialized.current) return;

    isInitialized.current = true;

    // const id = setTimeout(() => {
    //   console.log("Refreshing");
    void refreshToday();
    // }, 0);

    // return () => clearTimeout(id);
  }, [authLoading, user?.user_id, refreshToday]);

  // keep in sync with task mutations fired anywhere in the app
  useEffect(() => {
    const handleTasksChanged = () => {
      void refreshToday();
    };
    window.addEventListener("taskboard:tasks-changed", handleTasksChanged);
    return () =>
      window.removeEventListener("taskboard:tasks-changed", handleTasksChanged);
  }, [refreshToday]);

  const actionableCount =
    stats.overdue_total +
    Math.max(0, stats.today_total - stats.today_completed);

  return (
    <TodayContext.Provider
      value={{
        today,
        overdue,
        stats,
        actionableCount,
        isLoading,
        refreshToday,
      }}
    >
      {children}
    </TodayContext.Provider>
  );
};
