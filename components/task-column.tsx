"use client";

import { useDroppable } from "@dnd-kit/react";
import { Badge } from "@/components/UI/badge";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";
import { TaskCard } from "./task-card";

const MAX_VISIBLE_TASKS = 5;

export function TaskColumn({
  title,
  dotClass,
  status,
  tasks,
  totalCount = tasks.length,
}: {
  title: string;
  dotClass: string;
  status: TaskType["status"];
  tasks: TaskType[];
  totalCount?: number;
}) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
  });

  const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS);
  const hiddenCount = Math.max(0, totalCount - visibleTasks.length);

  return (
    <div
      ref={ref}
      className={cn(
        "flex-1 min-w-0 rounded-lg p-1 transition-colors",
        isDropTarget && "bg-muted/60 ring-2 ring-primary/40",
      )}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge variant="outline">{totalCount}</Badge>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto px-1 pb-1">
        {visibleTasks.length ? (
          visibleTasks.map((task) => (
            <TaskCard key={task.task_id} task={task} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            {isDropTarget ? "Drop here" : "No tasks"}
          </p>
        )}
        {hiddenCount > 0 && (
          <p className="px-1 text-xs text-muted-foreground">
            +{hiddenCount} more
          </p>
        )}
      </div>
    </div>
  );
}
