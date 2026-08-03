"use client";

import { LayoutDashboard } from "lucide-react";

import { AnalyticsStatCards } from "@/components/analytics/analytics-stat-cards";
import { OverviewHighlightsCard } from "@/components/analytics/overview-highlights-card";
import { PriorityBreakdownCard } from "@/components/analytics/priority-breakdown-card";
import { StatusBreakdownCard } from "@/components/analytics/status-breakdown-card";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function AnalyticsOverviewPage() {
  const { analytics, isLoading } = useAnalytics();

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : "A quick snapshot of where things stand."}
        </p>
      </div>

      <AnalyticsStatCards overview={analytics.overview} />

      <OverviewHighlightsCard analytics={analytics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusBreakdownCard statusBreakdown={analytics.statusBreakdown} />
        <PriorityBreakdownCard
          priorityBreakdown={analytics.priorityBreakdown}
        />
      </div>
    </div>
  );
}
