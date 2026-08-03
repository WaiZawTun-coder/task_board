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

type CalendarContextType = {
  tasks: TaskType[];
  isLoading: boolean;
  loadRange: (start: Date, end: Date) => Promise<void>;
};

const CalendarContext = createContext<CalendarContextType | null>(null);

export const useCalendar = () =>
  useContext(CalendarContext) as CalendarContextType;

// yyyy-MM-dd using local date parts, so the range sent to the API matches
// what the visible grid is actually showing (avoids UTC off-by-one).
const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CalendarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authLoading } = useAuth();
  const fetchApi = useApi();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const calendarLoading = useRef(false);
  const lastRange = useRef<{ start: Date; end: Date } | null>(null);

  const loadRange = useCallback(
    async (start: Date, end: Date) => {
      if (authLoading || !user?.user_id || calendarLoading.current) return;

      calendarLoading.current = true;
      lastRange.current = { start, end };
      setIsLoading(true);

      try {
        const query = new URLSearchParams({
          start: toDateKey(start),
          end: toDateKey(end),
        });

        const data: { success: boolean; data: TaskType[] } = await fetchApi(
          `/api/protected/calendar?${query.toString()}`,
        );

        if (data.success) setTasks(data.data || []);
      } finally {
        calendarLoading.current = false;
        setIsLoading(false);
      }
    },
    [authLoading, fetchApi, user?.user_id],
  );

  // keep the currently visible range in sync with mutations fired anywhere
  // in the app (create/update/delete task), same event TodayContext uses
  useEffect(() => {
    const handleTasksChanged = () => {
      if (lastRange.current) {
        void loadRange(lastRange.current.start, lastRange.current.end);
      }
    };
    window.addEventListener("taskboard:tasks-changed", handleTasksChanged);
    return () =>
      window.removeEventListener("taskboard:tasks-changed", handleTasksChanged);
  }, [loadRange]);

  return (
    <CalendarContext.Provider value={{ tasks, isLoading, loadRange }}>
      {children}
    </CalendarContext.Provider>
  );
};
