import TaskType from "@/lib/types/task";

/**
 * Safely parses a task's `due` value into a Date, returning null if
 * missing or invalid. Shared by the calendar page and calendar-month
 * grid so due-date parsing logic lives in one place.
 */
export function getTaskDueDate(task: TaskType): Date | null {
  if (!task.due) return null;
  const date = new Date(task.due);
  return Number.isNaN(date.getTime()) ? null : date;
}
