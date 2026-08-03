import { PriorityBreakdown, StatusBreakdown } from "@/lib/types/analytics";

export const STATUS_CONFIG: Record<
  keyof StatusBreakdown,
  { label: string; barClass: string; dotClass: string }
> = {
  pending: {
    label: "To Do",
    barClass: "bg-gray-400",
    dotClass: "bg-gray-400",
  },
  on_going: {
    label: "In Progress",
    barClass: "bg-blue-500",
    dotClass: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    barClass: "bg-green-500",
    dotClass: "bg-green-500",
  },
  cancel: {
    label: "Cancelled",
    barClass: "bg-red-500",
    dotClass: "bg-red-500",
  },
};

export const STATUS_ORDER: (keyof StatusBreakdown)[] = [
  "pending",
  "on_going",
  "completed",
  "cancel",
];

export const PRIORITY_CONFIG: Record<
  keyof PriorityBreakdown,
  { label: string; barClass: string; dotClass: string }
> = {
  high: { label: "High", barClass: "bg-red-500", dotClass: "bg-red-500" },
  medium: {
    label: "Medium",
    barClass: "bg-yellow-500",
    dotClass: "bg-yellow-500",
  },
  low: { label: "Low", barClass: "bg-green-500", dotClass: "bg-green-500" },
};

export const PRIORITY_ORDER: (keyof PriorityBreakdown)[] = [
  "high",
  "medium",
  "low",
];
