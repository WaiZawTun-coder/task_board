"use client";

import { format } from "date-fns";
import { CalendarClock, CircleDot, Pencil } from "lucide-react";

import { Button } from "@/components/UI/button";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

type CalendarAgendaProps = {
  date: Date;
  tasks: TaskType[];
  projects: ProjectType[];
  onEditTask: (task: TaskType) => void;
};

const priorityClass: Record<TaskType["priority"], string> = {
  low: "text-green-700 dark:text-green-400",
  medium: "text-yellow-700 dark:text-yellow-400",
  high: "text-red-700 dark:text-red-400",
};

export function CalendarAgenda({ date, tasks, projects, onEditTask }: CalendarAgendaProps) {
  return (
    <section className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Selected day</p>
          <h2 className="text-lg font-semibold">{format(date, "EEEE, MMMM d")}</h2>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
          <CalendarClock className="h-7 w-7" />
          <p className="text-sm">No tasks due on this day.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const project = projects.find((item) => item.project_id === task.projectId);
            return (
              <div key={task.task_id} className="flex items-start gap-3 rounded-lg border p-3">
                <CircleDot className={cn("mt-0.5 h-4 w-4 shrink-0", priorityClass[task.priority])} />
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm font-medium", task.status === "completed" && "text-muted-foreground line-through")}>
                    {task.title}
                  </p>
                  {project && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color_hex }} />
                      {project.title}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => onEditTask(task)} aria-label={`Edit ${task.title}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
