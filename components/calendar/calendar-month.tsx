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

import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type CalendarMonthProps = {
  month: Date;
  selectedDate: Date;
  tasks: TaskType[];
  projects: ProjectType[];
  onSelectDate: (date: Date) => void;
};

function getTaskDate(task: TaskType) {
  const dueDate = new Date(task.due);
  return Number.isNaN(dueDate.getTime()) ? null : dueDate;
}

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
    const dueDate = getTaskDate(task);
    if (!dueDate) return;
    const key = format(dueDate, "yyyy-MM-dd");
    tasksByDay.set(key, [...(tasksByDay.get(key) ?? []), task]);
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-7 border-b bg-muted/40">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="p-2 text-center text-xs font-medium text-muted-foreground sm:p-3 sm:text-sm">
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayTasks = tasksByDay.get(format(day, "yyyy-MM-dd")) ?? [];
          const outsideMonth = !isSameMonth(day, month);
          const projectForTask = (task: TaskType) =>
            projects.find((project) => project.project_id === task.projectId);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-pressed={isSameDay(day, selectedDate)}
              className={cn(
                "min-h-24 border-b border-r p-1.5 text-left transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-32 sm:p-2",
                outsideMonth && "bg-muted/20 text-muted-foreground",
                isSameDay(day, selectedDate) && "bg-primary/5 ring-1 ring-inset ring-primary/30",
              )}
            >
              <span
                className={cn(
                  "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium sm:text-sm",
                  isToday(day) && "bg-primary text-primary-foreground",
                )}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const project = projectForTask(task);
                  return (
                    <div
                      key={task.task_id}
                      className={cn(
                        "truncate rounded px-1.5 py-1 text-[10px] font-medium sm:text-xs",
                        task.status === "completed"
                          ? "bg-green-500/10 text-green-700 line-through dark:text-green-400"
                          : "bg-primary/10 text-primary",
                      )}
                      title={task.title}
                    >
                      {project && (
                        <span
                          className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: project.color_hex }}
                        />
                      )}
                      {task.title}
                    </div>
                  );
                })}
                {dayTasks.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground sm:text-xs">
                    +{dayTasks.length - 3} more
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
