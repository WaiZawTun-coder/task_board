"use client";

import { useMemo, useState } from "react";
import { addMonths, isSameDay, startOfMonth, subMonths } from "date-fns";
import { CalendarDays } from "lucide-react";

import { CalendarAgenda } from "@/components/calendar/calendar-agenda";
import { CalendarMonth } from "@/components/calendar/calendar-month";
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar";
import NewTask from "@/components/newTask";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import TaskType from "@/lib/types/task";

function getTaskDate(task: TaskType) {
  const dueDate = new Date(task.due);
  return Number.isNaN(dueDate.getTime()) ? null : dueDate;
}

export default function CalendarPage() {
  const { tasks, createTask, updateTask } = useTask();
  const { projects } = useProject();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const selectedTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const dueDate = getTaskDate(task);
        return dueDate ? isSameDay(dueDate, selectedDate) : false;
      }),
    [tasks, selectedDate],
  );

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    if (date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()) {
      setMonth(startOfMonth(date));
    }
  };

  const handleSave = async (payload: Parameters<typeof updateTask>[0]) => updateTask(payload);
  const handleCreate = async (payload: Parameters<typeof createTask>[0]) => createTask(payload);

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="h-6 w-6" />
            Calendar
          </h1>
          <p className="text-sm text-muted-foreground">Plan your work and keep track of due dates.</p>
        </div>
        <NewTask onCreate={handleCreate} />
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
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
        onSave={handleSave}
      />
    </div>
  );
}
