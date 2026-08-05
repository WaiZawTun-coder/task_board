"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays } from "lucide-react";

import { CalendarAgenda } from "@/components/calendar/calendar-agenda";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import NewTask from "@/components/newTask";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import { useCalendarQuery } from "@/hooks/queries/useCalendarQuery";
import { getTaskDueDate } from "@/lib/calendar-utils";
import TaskType from "@/lib/types/task";

export default function CalendarPage() {
  const { createTask, updateTask } = useTask();
  const { projects } = useProject();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const { tasks, isLoading } = useCalendarQuery(gridStart, gridEnd);

  const selectedTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = getTaskDueDate(task);
        return dueDate ? isSameDay(dueDate, selectedDate) : false;
      }),
    [tasks, selectedDate],
  );

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (
      date.getMonth() !== month.getMonth() ||
      date.getFullYear() !== month.getFullYear()
    ) {
      setMonth(startOfMonth(date));
    }
  };

  return (
    <div className="min-w-full space-y-4 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <CalendarDays className="h-5 w-5" />
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading…"
              : "Plan your work and keep track of due dates."}
          </p>
        </div>
        <NewTask onCreate={createTask} />
      </div>

      <CalendarToolbar
        month={month}
        onPreviousMonth={() => setMonth((current) => subMonths(current, 1))}
        onNextMonth={() => setMonth((current) => addMonths(current, 1))}
        onToday={() => {
          const today = new Date();
          setMonth(startOfMonth(today));
          setSelectedDate(today);
        }}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <CalendarMonth
          month={month}
          selectedDate={selectedDate}
          tasks={tasks}
          projects={projects}
          onSelectDate={handleSelectDate}
        />
        <CalendarAgenda
          date={selectedDate}
          tasks={selectedTasks}
          projects={projects}
          onEditTask={setEditingTask}
        />
      </div>

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={updateTask}
      />
    </div>
  );
}
