"use client";

import { format } from "date-fns";
import { CalendarIcon, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";
import ProjectType from "@/lib/types/project";

const statusConfig: Record<
  TaskType["status"],
  { label: string; className: string }
> = {
  pending: { label: "To Do", className: "bg-muted text-muted-foreground" },
  on_going: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  cancel: {
    label: "Cancelled",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
  completed: {
    label: "Completed",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
};

const priorityConfig: Record<
  TaskType["priority"],
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  high: {
    label: "High",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

function getDueDate(task: TaskType) {
  if (!task.due) return null;
  const date = new Date(task.due);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isCompleted(task: TaskType) {
  return task.status === "completed";
}

function isOverdue(task: TaskType) {
  const due = getDueDate(task);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today && task.status !== "cancel";
}

type TaskListItemProps = {
  task: TaskType;
  project?: ProjectType;
  onStatusChange: (status: TaskType["status"]) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskListItem({
  task,
  project,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskListItemProps) {
  const due = getDueDate(task);
  const overdue = isOverdue(task);

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{task.title}</p>
          {project && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: project.color_hex }}
              />
              {project.title}
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {due && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs text-muted-foreground",
              overdue &&
                task.status !== "completed" &&
                "font-medium text-destructive",
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {format(due, "MMM d")}
          </span>
        )}

        <Badge
          className={cn("border-none", priorityConfig[task.priority].className)}
        >
          {priorityConfig[task.priority].label}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Badge
              className={cn(
                "cursor-pointer border-none",
                statusConfig[task.status].className,
              )}
            >
              {statusConfig[task.status].label}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(statusConfig) as TaskType["status"][]).map(
              (status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => onStatusChange(status)}
                >
                  {statusConfig[status].label}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon-sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
