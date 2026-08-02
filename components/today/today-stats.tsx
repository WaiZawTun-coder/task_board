import { AlertTriangle, CalendarCheck2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";

type TodayStatsProps = {
  overdueCount: number;
  todayCount: number;
  completedTodayCount: number;
};

export function TodayStats({
  overdueCount,
  todayCount,
  completedTodayCount,
}: TodayStatsProps) {
  const stats = [
    {
      label: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      accent: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
    {
      label: "Due Today",
      value: todayCount,
      icon: CalendarCheck2,
      accent:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Completed Today",
      value: completedTodayCount,
      icon: CheckCircle2,
      accent:
        "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
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
