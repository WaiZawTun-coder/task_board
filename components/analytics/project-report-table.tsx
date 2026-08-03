import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { ProjectBreakdown } from "@/lib/types/analytics";

export function ProjectReportTable({
  projectBreakdown,
}: {
  projectBreakdown: ProjectBreakdown[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Detailed completion numbers for every project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projectBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Project</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Completed</th>
                  <th className="py-2 font-medium">Remaining</th>
                  <th className="py-2 font-medium">Completion</th>
                </tr>
              </thead>
              <tbody>
                {projectBreakdown.map((project) => {
                  const percent = project.total
                    ? Math.round((project.completed / project.total) * 100)
                    : 0;
                  return (
                    <tr
                      key={project.project_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-2">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: project.color_hex }}
                          />
                          <span className="truncate">{project.title}</span>
                        </span>
                      </td>
                      <td className="py-2 tabular-nums">{project.total}</td>
                      <td className="py-2 tabular-nums">{project.completed}</td>
                      <td className="py-2 tabular-nums">
                        {project.total - project.completed}
                      </td>
                      <td className="py-2 tabular-nums text-muted-foreground">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
