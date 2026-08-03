import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";

type BreakdownRow = {
  key: string;
  label: string;
  count: number;
  dotClass: string;
};

type BreakdownReportTableProps = {
  title: string;
  description: string;
  rows: BreakdownRow[];
};

export function BreakdownReportTable({
  title,
  description,
  rows,
}: BreakdownReportTableProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="text-sm text-muted-foreground">No data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Label</th>
                  <th className="py-2 font-medium">Count</th>
                  <th className="py-2 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const percent = total
                    ? Math.round((row.count / total) * 100)
                    : 0;
                  return (
                    <tr key={row.key} className="border-b last:border-0">
                      <td className="py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${row.dotClass}`}
                          />
                          {row.label}
                        </span>
                      </td>
                      <td className="py-2 tabular-nums">{row.count}</td>
                      <td className="py-2 tabular-nums text-muted-foreground">
                        {percent}%
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-medium">
                  <td className="py-2">Total</td>
                  <td className="py-2 tabular-nums">{total}</td>
                  <td className="py-2 tabular-nums text-muted-foreground">
                    100%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
