"use client";

import { queryKeys } from "@/lib/query-keys";
import TaskType from "@/lib/types/task";
import { useApi } from "@/utilities/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// yyyy-MM-dd using local date parts — matches what CalendarContext did,
// avoids UTC off-by-one against the visible grid.
const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useCalendarQuery(start: Date, end: Date) {
  const fetchApi = useApi();

  const startKey = toDateKey(start);
  const endKey = toDateKey(end);

  const query = useQuery({
    queryKey: queryKeys.calendar(startKey, endKey),
    queryFn: () =>
      fetchApi<{ success: boolean; data: TaskType[] }>(
        `/api/protected/calendar?start=${startKey}&end=${endKey}`,
      ),
    enabled: true,
    placeholderData: keepPreviousData,
  });

  return {
    tasks: query.data?.data ?? [],
    isLoading: query.isLoading,
  };
}
