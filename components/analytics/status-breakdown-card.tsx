import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/analytics-config";
import { StatusBreakdown } from "@/lib/types/analytics";

export function StatusBreakdownCard({
  statusBreakdown,
}: {
  statusBreakdown: StatusBreakdown;
}) {
  const total = STATUS_ORDER.reduce(
    (sum, key) => sum + statusBreakdown[key],
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Breakdown</CardTitle>
        <CardDescription>
          How your tasks are distributed by status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          STATUS_ORDER.map((key) => {
            const count = statusBreakdown[key];
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {STATUS_CONFIG[key].label}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${STATUS_CONFIG[key].barClass}`}
                    style={{ width: `${percent}%` }}
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
