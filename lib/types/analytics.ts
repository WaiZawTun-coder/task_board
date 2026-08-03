type AnalyticsOverview = {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
};

type StatusBreakdown = {
  pending: number;
  on_going: number;
  cancel: number;
  completed: number;
};

type PriorityBreakdown = {
  low: number;
  medium: number;
  high: number;
};

type ProjectBreakdown = {
  project_id: number;
  title: string;
  color_hex: string;
  total: number;
  completed: number;
};

type CreationTrendPoint = {
  date: string;
  count: number;
};

type AnalyticsData = {
  overview: AnalyticsOverview;
  statusBreakdown: StatusBreakdown;
  priorityBreakdown: PriorityBreakdown;
  projectBreakdown: ProjectBreakdown[];
  creationTrend: CreationTrendPoint[];
};

export type {
  AnalyticsOverview,
  StatusBreakdown,
  PriorityBreakdown,
  ProjectBreakdown,
  CreationTrendPoint,
  AnalyticsData,
};
