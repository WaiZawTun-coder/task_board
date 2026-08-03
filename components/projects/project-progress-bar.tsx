import { Card, CardContent } from "@/components/UI/card";
import { ProjectStats } from "@/lib/types/project";

export function ProjectProgressBar({ stats }: { stats: ProjectStats }) {
  const percent = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <Card size="sm">
      <CardContent>
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="font-medium">Overall progress</span>
          <span className="text-muted-foreground">
            {stats.completed}/{stats.total} tasks ({percent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
