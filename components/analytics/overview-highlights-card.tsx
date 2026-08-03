import {
  CheckCircle2,
  Flame,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { STATUS_CONFIG } from "@/lib/analytics-config";
import { AnalyticsData } from "@/lib/types/analytics";

function getDominantStatus(statusBreakdown: AnalyticsData["statusBreakdown"]) {
  const entries = Object.entries(statusBreakdown) as [
    keyof AnalyticsData["statusBreakdown"],
    number,
  ][];
  const [topStatus] = entries.reduce((max, entry) =>
    entry[1] > max[1] ? entry : max,
  );
  return topStatus;
}

function getBusiestProject(
  projectBreakdown: AnalyticsData["projectBreakdown"],
) {
  if (projectBreakdown.length === 0) return null;
  return projectBreakdown.reduce((max, project) =>
    project.total > max.total ? project : max,
  );
}

// compares the two most recent 7-day windows in the 14-day creation trend
function getWeeklyTrend(creationTrend: AnalyticsData["creationTrend"]) {
  if (creationTrend.length < 14) return null;
  const previousWeek = creationTrend.slice(0, 7);
  const lastWeek = creationTrend.slice(7, 14);
  const previousTotal = previousWeek.reduce((sum, p) => sum + p.count, 0);
  const lastTotal = lastWeek.reduce((sum, p) => sum + p.count, 0);
  return { previousTotal, lastTotal };
}

export function OverviewHighlightsCard({
  analytics,
}: {
  analytics: AnalyticsData;
}) {
  const { overview, statusBreakdown, projectBreakdown, creationTrend } =
    analytics;

  const dominantStatus =
    overview.total > 0 ? getDominantStatus(statusBreakdown) : null;
  const busiestProject = getBusiestProject(projectBreakdown);
  const weeklyTrend = getWeeklyTrend(creationTrend);

  const highlights: { icon: typeof CheckCircle2; text: string }[] = [];

  highlights.push({
    icon: CheckCircle2,
    text:
      overview.total > 0
        ? `${overview.completionRate}% of your tasks are completed (${overview.completed} of ${overview.total}).`
        : "No tasks yet — create one to see your stats.",
  });

  if (dominantStatus) {
    highlights.push({
      icon: Flame,
      text: `Most of your tasks are currently "${STATUS_CONFIG[dominantStatus].label}" (${statusBreakdown[dominantStatus]} tasks).`,
    });
  }

  if (busiestProject) {
    highlights.push({
      icon: Trophy,
      text: `"${busiestProject.title}" is your busiest project with ${busiestProject.total} task${busiestProject.total === 1 ? "" : "s"}.`,
    });
  }

  if (weeklyTrend) {
    const { previousTotal, lastTotal } = weeklyTrend;
    const diff = lastTotal - previousTotal;
    const TrendIcon = diff >= 0 ? TrendingUp : TrendingDown;
    const trendText =
      diff === 0
        ? "You created the same number of tasks this week as last week."
        : diff > 0
          ? `You created ${diff} more task${diff === 1 ? "" : "s"} this week than last week.`
          : `You created ${Math.abs(diff)} fewer task${Math.abs(diff) === 1 ? "" : "s"} this week than last week.`;
    highlights.push({ icon: TrendIcon, text: trendText });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Highlights</CardTitle>
        <CardDescription>Quick takeaways from your activity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {highlights.map((highlight, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <highlight.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm">{highlight.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
