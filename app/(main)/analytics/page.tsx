"use client";

import { ChartColumn } from "lucide-react";

import { AnalyticsStatCards } from "@/components/analytics/analytics-stat-cards";
import { CreationTrendCard } from "@/components/analytics/creation-trend-card";
import { PriorityBreakdownCard } from "@/components/analytics/priority-breakdown-card";
import { ProjectBreakdownCard } from "@/components/analytics/project-breakdown-card";
import { StatusBreakdownCard } from "@/components/analytics/status-breakdown-card";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function AnalyticsPage() {
  const { analytics, isLoading } = useAnalytics();

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <ChartColumn className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading…"
            : "A closer look at how your work is trending."}
        </p>
      </div>

      <AnalyticsStatCards overview={analytics.overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusBreakdownCard statusBreakdown={analytics.statusBreakdown} />
        <PriorityBreakdownCard
          priorityBreakdown={analytics.priorityBreakdown}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CreationTrendCard creationTrend={analytics.creationTrend} />
        </div>
        <ProjectBreakdownCard projectBreakdown={analytics.projectBreakdown} />
      </div>
    </div>
  );
}
