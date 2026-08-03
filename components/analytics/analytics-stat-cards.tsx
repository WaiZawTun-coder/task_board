import {
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { AnalyticsOverview } from "@/lib/types/analytics";

export function AnalyticsStatCards({
  overview,
}: {
  overview: AnalyticsOverview;
}) {
  const stats = [
    {
      label: "Total Tasks",
      value: overview.total,
      icon: ListTodo,
      accent:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: overview.completed,
      icon: CheckCircle2,
      accent:
        "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "Overdue",
      value: overview.overdue,
      icon: AlertTriangle,
      accent: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: "Completion Rate",
      value: `${overview.completionRate}%`,
      icon: TrendingUp,
      accent:
        "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.accent}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
