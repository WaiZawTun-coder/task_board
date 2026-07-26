"use client";

import { PackageOpen } from "lucide-react";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { TaskListItem } from "./task-list-item";

type TaskListProps = {
  tasks: TaskType[];
  projects: ProjectType[];
  onStatusChange: (task: TaskType, status: TaskType["status"]) => void;
  onEdit: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
};

const taskProjectId = (task: TaskType) =>
  task.projectId ?? (task as TaskType & { project_id?: number }).project_id;

export function TaskList({
  tasks,
  projects,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No tasks found</p>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters, or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskListItem
          key={task.task_id}
          task={task}
          project={projects.find(
            (project) => project.project_id === taskProjectId(task),
          )}
          onStatusChange={(status) => onStatusChange(task, status)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task)}
        />
      ))}
    </div>
  );
}
