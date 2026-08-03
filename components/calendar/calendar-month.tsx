"use client";

import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { getTaskDueDate } from "@/lib/calendar-utils";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { DayTaskPill } from "./day-task-pill";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_TASKS = 2;

type CalendarMonthProps = {
  month: Date;
  selectedDate: Date;
  tasks: TaskType[];
  projects: ProjectType[];
  onSelectDate: (date: Date) => void;
};

export function CalendarMonth({
  month,
  selectedDate,
  tasks,
  projects,
  onSelectDate,
}: CalendarMonthProps) {
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  });

  const tasksByDay = new Map<string, TaskType[]>();
  tasks.forEach((task) => {
    const dueDate = getTaskDueDate(task);
    if (!dueDate) return;
    const key = format(dueDate, "yyyy-MM-dd");
    tasksByDay.set(key, [...(tasksByDay.get(key) ?? []), task]);
  });

  const projectForTask = (task: TaskType) =>
    projects.find((project) => project.project_id === task.projectId);

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="p-1.5 text-center text-[11px] font-medium text-muted-foreground sm:p-2 sm:text-xs"
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayTasks = tasksByDay.get(format(day, "yyyy-MM-dd")) ?? [];
          const outsideMonth = !isSameMonth(day, month);
          const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
          const hiddenCount = dayTasks.length - visibleTasks.length;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={isSameDay(day, selectedDate)}
              className={cn(
                "min-h-16 border-r border-b p-1 text-left transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:min-h-24 sm:p-1.5",
                outsideMonth && "bg-muted/20 text-muted-foreground",
                isSameDay(day, selectedDate) &&
                  "bg-primary/5 ring-1 ring-primary/30 ring-inset",
              )}
            >
              <span
                className={cn(
                  "mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-0.5">
                {visibleTasks.map((task) => (
                  <DayTaskPill
                    key={task.task_id}
                    task={task}
                    project={projectForTask(task)}
                  />
                ))}
                {hiddenCount > 0 && (
                  <p className="px-1 text-[9px] text-muted-foreground">
                    +{hiddenCount} more
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
