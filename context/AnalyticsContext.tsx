"use client";

import { AnalyticsData } from "@/lib/types/analytics";
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

type AnalyticsContextType = {
  analytics: AnalyticsData;
  isLoading: boolean;
  refreshAnalytics: () => Promise<void>;
};

const EMPTY_ANALYTICS: AnalyticsData = {
  overview: { total: 0, completed: 0, overdue: 0, completionRate: 0 },
  statusBreakdown: { pending: 0, on_going: 0, cancel: 0, completed: 0 },
  priorityBreakdown: { low: 0, medium: 0, high: 0 },
  projectBreakdown: [],
  creationTrend: [],
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () =>
  useContext(AnalyticsContext) as AnalyticsContextType;

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const [analytics, setAnalytics] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const analyticsLoading = useRef<boolean>(false);
  const isInitialized = useRef(false);

  const refreshAnalytics = useCallback(async () => {
    if (authLoading || !user?.user_id || analyticsLoading.current) return;

    analyticsLoading.current = true;
    setIsLoading(true);

    try {
      const data: { success: boolean; data: AnalyticsData } = await fetchApi(
        "/api/protected/analytics",
      );

      if (data.success) setAnalytics(data.data);
    } finally {
      analyticsLoading.current = false;
      setIsLoading(false);
    }
  }, [authLoading, fetchApi, user?.user_id]);

  // deferred initial load, same pattern as NotificationContext/TaskContext
  useEffect(() => {
    if (authLoading || !user?.user_id || isInitialized.current) return;

    isInitialized.current = true;

    void refreshAnalytics();
  }, [authLoading, user?.user_id, refreshAnalytics]);

  // keep in sync with task mutations fired anywhere in the app
  useEffect(() => {
    const handleTasksChanged = () => {
      void refreshAnalytics();
    };
    window.addEventListener("taskboard:tasks-changed", handleTasksChanged);
    return () =>
      window.removeEventListener("taskboard:tasks-changed", handleTasksChanged);
  }, [refreshAnalytics]);

  return (
    <AnalyticsContext.Provider
      value={{ analytics, isLoading, refreshAnalytics }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
