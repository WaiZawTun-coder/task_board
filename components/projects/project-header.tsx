import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { PROJECT_STATUS_CONFIG } from "@/lib/project-config";
import { cn } from "@/lib/utils";
import { ProjectDetail } from "@/lib/types/project";

type ProjectHeaderProps = {
  project: ProjectDetail;
  onEdit: () => void;
  onDelete: () => void;
};

export function ProjectHeader({
  project,
  onEdit,
  onDelete,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="mt-1 h-4 w-4 shrink-0 rounded-full"
          style={{ backgroundColor: project.color_hex }}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-semibold">{project.title}</h1>
            <Badge
              className={cn(
                "border-none",
                PROJECT_STATUS_CONFIG[project.status].className,
              )}
            >
              {PROJECT_STATUS_CONFIG[project.status].label}
            </Badge>
          </div>
          {project.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
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
  );
}
