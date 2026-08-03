import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { CreationTrendPoint } from "@/lib/types/analytics";

export function CreationTrendTable({
  creationTrend,
}: {
  creationTrend: CreationTrendPoint[];
}) {
  const total = creationTrend.reduce((sum, point) => sum + point.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Created (Last 14 Days)</CardTitle>
        <CardDescription>Day-by-day breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {creationTrend.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Tasks created</th>
                </tr>
              </thead>
              <tbody>
                {creationTrend.map((point) => (
                  <tr key={point.date} className="border-b last:border-0">
                    <td className="py-2">
                      {format(parseISO(point.date), "EEE, MMM d")}
                    </td>
                    <td className="py-2 tabular-nums">{point.count}</td>
                  </tr>
                ))}
                <tr className="font-medium">
                  <td className="py-2">Total</td>
                  <td className="py-2 tabular-nums">{total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
