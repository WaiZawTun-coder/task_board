import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { PRIORITY_CONFIG, PRIORITY_ORDER } from "@/lib/analytics-config";
import { PriorityBreakdown } from "@/lib/types/analytics";

export function PriorityBreakdownCard({
  priorityBreakdown,
}: {
  priorityBreakdown: PriorityBreakdown;
}) {
  const total = PRIORITY_ORDER.reduce(
    (sum, key) => sum + priorityBreakdown[key],
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Breakdown</CardTitle>
        <CardDescription>Where your effort is concentrated</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No tasks yet.</p>
        ) : (
          PRIORITY_ORDER.map((key) => {
            const count = priorityBreakdown[key];
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {PRIORITY_CONFIG[key].label}
                  </span>
                  <span className="text-muted-foreground">
                    {count} ({percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${PRIORITY_CONFIG[key].barClass}`}
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
