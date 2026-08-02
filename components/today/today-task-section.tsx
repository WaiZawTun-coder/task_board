import { LucideIcon } from "lucide-react";
import { TaskList } from "@/components/tasks/task-list";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";

type TodayTaskSectionProps = {
  title: string;
  icon: LucideIcon;
  tasks: TaskType[];
  projects: ProjectType[];
  emptyMessage: string;
  onStatusChange: (task: TaskType, status: TaskType["status"]) => void;
  onEdit: (task: TaskType) => void;
  onDelete: (task: TaskType) => void;
};

export function TodayTaskSection({
  title,
  icon: Icon,
  tasks,
  projects,
  emptyMessage,
  onStatusChange,
  onEdit,
  onDelete,
}: TodayTaskSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium">{title}</h2>
        <span className="text-xs text-muted-foreground">({tasks.length})</span>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <TaskList
          tasks={tasks}
          projects={projects}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}
