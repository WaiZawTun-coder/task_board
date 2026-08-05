"use client";

import { useState } from "react";
import { AlertTriangle, CalendarCheck2, CalendarDays } from "lucide-react";

import NewTask from "@/components/newTask";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { TodayStats } from "@/components/today/today-stats";
import { TodayTaskSection } from "@/components/today/today-task-section";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import TaskType from "@/lib/types/task";
import { useTodayQuery } from "@/hooks/queries/useTodayQuery";

const TODAY_LABEL = new Intl.DateTimeFormat("en", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

export default function TodayPage() {
  const { createTask, updateTask, deleteTask } = useTask();
  const { projects } = useProject();
  const { today, overdue, stats, isLoading } = useTodayQuery();

  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const handleStatusChange = async (
    task: TaskType,
    status: TaskType["status"],
  ) => {
    if (task.status === status) return;
    try {
      // const result =
      await updateTask({
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        due: task.due,
        status,
        priority: task.priority,
      });
      // if (result.success) await refreshToday();
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDelete = async (task: TaskType) => {
    try {
      // const result =
      await deleteTask({ task_id: task.task_id });
      // if (result.success) await refreshToday();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleCreate = async (payload: Parameters<typeof createTask>[0]) => {
    const result = await createTask(payload);
    // if (result.success) await refreshToday();
    return result;
  };

  const handleSave = async (payload: Parameters<typeof updateTask>[0]) => {
    const result = await updateTask(payload);
    // if (result.success) await refreshToday();
    return result;
  };

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <CalendarDays className="h-6 w-6" />
            Today
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading…" : TODAY_LABEL}
          </p>
        </div>
        <NewTask onCreate={handleCreate} />
      </div>

      <TodayStats
        overdueCount={stats.overdue_total}
        todayCount={stats.today_total}
        completedTodayCount={stats.today_completed}
      />

      {overdue.length > 0 && (
        <TodayTaskSection
          title="Overdue"
          icon={AlertTriangle}
          tasks={overdue}
          projects={projects}
          emptyMessage="Nothing overdue. Nice work!"
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={handleDelete}
        />
      )}

      <TodayTaskSection
        title="Due Today"
        icon={CalendarCheck2}
        tasks={today}
        projects={projects}
        emptyMessage="No tasks due today. Enjoy the calm."
        onStatusChange={handleStatusChange}
        onEdit={setEditingTask}
        onDelete={handleDelete}
      />

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={handleSave}
      />
    </div>
  );
}
