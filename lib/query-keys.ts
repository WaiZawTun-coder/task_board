export const queryKeys = {
  dashboard: ["dashboard"] as const,
  today: ["today"] as const,
  tasks: (params: Record<string, unknown>) => ["tasks", params] as const,
  task: (id: number) => ["task", id] as const,
  calendar: (start: string, end: string) => ["calendar", start, end] as const,
  analytics: ["analytics"] as const,
  projects: ["projects"] as const,
  project: (id: number) => ["project", id] as const,
};
