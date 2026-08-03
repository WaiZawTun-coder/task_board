import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

type DayTaskPillProps = {
  task: TaskType;
  project?: ProjectType;
};

export function DayTaskPill({ task, project }: DayTaskPillProps) {
  return (
    <div
      className={cn(
        "truncate rounded px-1 py-0.5 text-[10px] leading-tight font-medium",
        task.status === "completed"
          ? "bg-green-500/10 text-green-700 line-through dark:text-green-400"
          : "bg-primary/10 text-primary",
      )}
      title={task.title}
    >
      {project && (
        <span
          className="mr-1 inline-block h-1.5 w-1.5 rounded-full align-middle"
          style={{ backgroundColor: project.color_hex }}
        />
      )}
      {task.title}
    </div>
  );
}
