"use client";

import { format } from "date-fns";
import { CalendarIcon, FolderKanban } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/UI/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

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

function getDueDate(task: TaskType) {
  if (!task.due) return null;
  const date = new Date(task.due);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isOverdue(task: TaskType) {
  const due = getDueDate(task);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today && task.status !== "cancel" && task.status !== "completed";
}

type TaskDetailMetadataProps = {
  task: TaskType;
  project?: ProjectType;
  onStatusChange: (status: TaskType["status"]) => void;
};

export function TaskDetailMetadata({
  task,
  project,
  onStatusChange,
}: TaskDetailMetadataProps) {
  const due = getDueDate(task);
  const overdue = isOverdue(task);

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-sm">Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Status
          </p>
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
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
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
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Due date
          </p>
          {due ? (
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                overdue && "font-medium text-destructive",
              )}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              {format(due, "PPP p")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No due date</p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Project
          </p>
          {project ? (
            <Link
              href={`/projects/${project.project_id}`}
              className="flex items-center gap-1.5 text-sm hover:underline"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: project.color_hex }}
              />
              <span className="truncate">{project.title}</span>
            </Link>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" />
              No project
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
