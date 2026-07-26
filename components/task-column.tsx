"use client";

import { useDroppable } from "@dnd-kit/react";
import { Badge } from "@/components/UI/badge";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";
import { TaskCard } from "./task-card";

export function TaskColumn({
  title,
  dotClass,
  status,
  tasks,
}: {
  title: string;
  dotClass: string;
  status: TaskType["status"];
  tasks: TaskType[];
}) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
  });

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
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <Badge variant="outline">{tasks.length}</Badge>
      </div>
      <div className="max-h-80 space-y-2 overflow-y-auto px-1 pb-1">
        {tasks.length ? (
          tasks.map((task) => <TaskCard key={task.task_id} task={task} />)
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            {isDropTarget ? "Drop here" : "No tasks"}
          </p>
        )}
      </div>
    </div>
  );
}
