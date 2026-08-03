import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { ProjectStats } from "@/lib/types/project";

export function ProjectStatsCards({ stats }: { stats: ProjectStats }) {
  const items = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: ListTodo,
      accent:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      accent:
        "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "In Progress",
      value: stats.on_going,
      icon: Clock,
      accent:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      accent: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.accent}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">
                {item.value}
              </p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
