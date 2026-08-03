import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { ProjectBreakdown } from "@/lib/types/analytics";

export function ProjectBreakdownCard({
  projectBreakdown,
}: {
  projectBreakdown: ProjectBreakdown[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>By Project</CardTitle>
        <CardDescription>
          Completion progress across your projects
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projectBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          projectBreakdown.map((project) => {
            const percent = project.total
              ? Math.round((project.completed / project.total) * 100)
              : 0;
            return (
              <div key={project.project_id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color_hex }}
                    />
                    <span className="truncate font-medium">
                      {project.title}
                    </span>
                  </div>
                  <span className="shrink-0 text-muted-foreground">
                    {project.completed}/{project.total}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: project.color_hex,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
