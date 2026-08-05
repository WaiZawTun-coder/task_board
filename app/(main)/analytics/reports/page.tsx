"use client";

import { FileText } from "lucide-react";

import { BreakdownReportTable } from "@/components/analytics/breakdown-report-table";
import { CreationTrendTable } from "@/components/analytics/creation-trend-table";
import { ProjectReportTable } from "@/components/analytics/project-report-table";
import { useAnalyticsQuery } from "@/hooks/queries/useAnalyticsQuery";
import {
  PRIORITY_CONFIG,
  PRIORITY_ORDER,
  STATUS_CONFIG,
  STATUS_ORDER,
} from "@/lib/analytics-config";

export default function AnalyticsReportsPage() {
  const { analytics, isLoading } = useAnalyticsQuery();

  const statusRows = STATUS_ORDER.map((key) => ({
    key,
    label: STATUS_CONFIG[key].label,
    count: analytics.statusBreakdown[key],
    dotClass: STATUS_CONFIG[key].dotClass,
  }));

  const priorityRows = PRIORITY_ORDER.map((key) => ({
    key,
    label: PRIORITY_CONFIG[key].label,
    count: analytics.priorityBreakdown[key],
    dotClass: PRIORITY_CONFIG[key].dotClass,
  }));

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <FileText className="h-6 w-6" />
          Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : "Detailed numbers behind the charts."}
        </p>
      </div>

      <ProjectReportTable projectBreakdown={analytics.projectBreakdown} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownReportTable
          title="Status Breakdown"
          description="Task counts by status"
          rows={statusRows}
        />
        <BreakdownReportTable
          title="Priority Breakdown"
          description="Task counts by priority"
          rows={priorityRows}
        />
      </div>

      <CreationTrendTable creationTrend={analytics.creationTrend} />
    </div>
  );
}
