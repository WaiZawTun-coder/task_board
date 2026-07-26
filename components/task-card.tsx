"use client";

import { useDraggable } from "@dnd-kit/react";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";

const formatDueDate = (task: TaskType) => {
  if (!task.due) return "No due date";
  const date = new Date(task.due);
  if (Number.isNaN(date.getTime())) return "No due date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
};

export function TaskCard({ task }: { task: TaskType }) {
  const { ref, isDragging } = useDraggable({
    id: task.task_id,
    // attach the full task so onDragEnd can read it back without a lookup
    data: { task },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "cursor-grab rounded-lg border bg-background p-3 text-sm shadow-sm transition-opacity active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <p className="truncate font-medium">{task.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDueDate(task)}
      </p>
    </div>
  );
}
