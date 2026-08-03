import ProjectType from "@/lib/types/project";

export const PROJECT_STATUS_CONFIG: Record<
  ProjectType["status"],
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

export const PROJECT_STATUS_ORDER: ProjectType["status"][] = [
  "active",
  "completed",
  "archived",
];
