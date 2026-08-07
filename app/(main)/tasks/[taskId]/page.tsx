"use client";

import { ClipboardList } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/UI/button";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { TaskDetailHeader } from "@/components/tasks/task-detail-header";
import { TaskDetailMetadata } from "@/components/tasks/task-detail-metadata";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import { useTaskQuery } from "@/hooks/queries/useTaskQuery";
import TaskType from "@/lib/types/task";

const taskProjectId = (task: TaskType) =>
  task.projectId ?? (task as TaskType & { project_id?: number }).project_id;

export default function TaskDetailPage() {
  const params = useParams<{ taskId: string }>();
  const router = useRouter();
  const taskId = Number(params.taskId);

  const { projects } = useProject();
  const { updateTask, deleteTask } = useTask();

  const { task, isLoading, notFound, error, refetch } = useTaskQuery({
    taskId,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const project = task
    ? projects.find((p) => p.project_id === taskProjectId(task))
    : undefined;

  const handleStatusChange = async (status: TaskType["status"]) => {
    if (!task || task.status === status) return;
    try {
      await updateTask({
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        due: task.due,
        status,
        priority: task.priority,
      });
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDelete = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    if (!task) return { success: false };
    const result = await deleteTask({ task_id: task.task_id });
    if (result.success) router.push("/tasks");
    return result;
  };

  if (notFound) {
    return (
      <div className="flex min-w-full flex-col items-center justify-center gap-3 p-12 text-center">
        <ClipboardList className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Task not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This task doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Button onClick={() => router.push("/tasks")}>Back to tasks</Button>
      </div>
    );
  }

  if (isLoading && !task) {
    return (
      <div className="min-w-full space-y-6 p-4 sm:p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-lg bg-muted lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-w-full flex-col items-center justify-center gap-3 p-12 text-center">
        <p className="text-sm text-destructive">
          {error || "Unable to load this task."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <TaskDetailHeader
        task={task}
        onBack={() => router.push("/tasks")}
        onEdit={() => setIsEditing(true)}
        onDelete={() => setIsDeleting(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 sm:p-6 lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">
            Description
          </h2>
          {task.description ? (
            <p className="whitespace-pre-wrap text-sm">{task.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No description provided.
            </p>
          )}
        </div>

        <TaskDetailMetadata
          task={task}
          project={project}
          onStatusChange={handleStatusChange}
        />
      </div>

      <EditTaskDialog
        task={task}
        open={isEditing}
        onOpenChange={setIsEditing}
        onSave={updateTask}
      />

      <DeleteTaskDialog
        task={task}
        open={isDeleting}
        onOpenChange={setIsDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
