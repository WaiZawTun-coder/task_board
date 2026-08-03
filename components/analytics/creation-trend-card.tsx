"use client";

import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { CreationTrendPoint } from "@/lib/types/analytics";

export function CreationTrendCard({
  creationTrend,
}: {
  creationTrend: CreationTrendPoint[];
}) {
  const max = Math.max(1, ...creationTrend.map((point) => point.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Created</CardTitle>
        <CardDescription>Last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        {creationTrend.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="flex h-32 items-end gap-1.5 sm:gap-2">
            {creationTrend.map((point) => {
              const height = Math.max(4, Math.round((point.count / max) * 100));
              const date = parseISO(point.date);
              return (
                <div
                  key={point.date}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  title={`${format(date, "MMM d")}: ${point.count} task${point.count === 1 ? "" : "s"}`}
                >
                  <div
                    className="w-full rounded-t-sm bg-primary/70 transition-colors group-hover:bg-primary"
                    style={{ height: `${height}%` }}
                  />
                  <span className="mt-1.5 text-[9px] text-muted-foreground sm:text-[10px]">
                    {format(date, "d")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
