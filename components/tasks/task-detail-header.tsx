import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";

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
    label: "Low priority",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  medium: {
    label: "Medium priority",
    className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  },
  high: {
    label: "High priority",
    className: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

type TaskDetailHeaderProps = {
  task: TaskType;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function TaskDetailHeader({
  task,
  onBack,
  onEdit,
  onDelete,
}: TaskDetailHeaderProps) {
  return (
    <div className="space-y-3">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1
            className={cn(
              "truncate text-2xl font-semibold",
              task.status === "completed" &&
                "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              className={cn("border-none", statusConfig[task.status].className)}
            >
              {statusConfig[task.status].label}
            </Badge>
            <Badge
              className={cn(
                "border-none",
                priorityConfig[task.priority].className,
              )}
            >
              {priorityConfig[task.priority].label}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
