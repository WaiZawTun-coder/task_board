"use client";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import NewTask from "@/components/newTask";
import { useTask } from "@/context/TaskContext";

// --- Mock data — replace each of these with real fetches -------------------
// e.g. GET /api/protected/task/stats, /api/protected/task?status=..., etc.

const STATS = [
  {
    label: "Total Tasks",
    value: 24,
    icon: ListTodo,
    accent: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "Completed",
    value: 12,
    icon: CheckCircle2,
    accent:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    label: "In Progress",
    value: 8,
    icon: Clock,
    accent:
      "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  {
    label: "Overdue",
    value: 4,
    icon: AlertTriangle,
    accent: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  },
];

const BOARD = {
  todos: [
    { id: 1, title: "Plan weekend trip", due: "Apr 25" },
    { id: 2, title: "Buy groceries", due: "Apr 22" },
    { id: 3, title: "Review monthly budget", due: null },
  ],
  inProgress: [
    { id: 1, title: "Finish reading book", due: "Apr 30" },
    { id: 2, title: "Organize home office", due: null },
  ],
  done: [
    { id: 1, title: "Call dentist", due: "Apr 20" },
    { id: 2, title: "Pay utility bills", due: "Apr 19" },
  ],
};

const PROJECTS = [
  {
    id: "website-redesign",
    name: "Website Redesign",
    color: "#3b82f6",
    progress: 68,
  },
  { id: "mobile-app", name: "Mobile App", color: "#a855f7", progress: 34 },
  { id: "q4-marketing", name: "Q4 Marketing", color: "#22c55e", progress: 90 },
];

const UPCOMING = [
  {
    id: 1,
    title: "Design review",
    date: "Today, 3:00 PM",
    project: "Website Redesign",
  },
  {
    id: 2,
    title: "Sprint planning",
    date: "Tomorrow, 10:00 AM",
    project: "Mobile App",
  },
  { id: 3, title: "Campaign launch", date: "Apr 24", project: "Q4 Marketing" },
];

const ACTIVITY = [
  {
    id: 1,
    user: "AK",
    action: "completed",
    target: "Update landing page copy",
    time: "10m ago",
  },
  {
    id: 2,
    user: "JL",
    action: "commented on",
    target: "Mobile onboarding flow",
    time: "1h ago",
  },
  {
    id: 3,
    user: "MS",
    action: "created",
    target: "Q4 budget review",
    time: "3h ago",
  },
  {
    id: 4,
    user: "AK",
    action: "moved",
    target: "Fix login bug to Done",
    time: "5h ago",
  },
];

// --- Small presentational helpers -------------------------------------------

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: (typeof STATS)[number]) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold leading-none">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumn({
  title,
  count,
  dotClass,
  tasks,
}: {
  title: string;
  count: number;
  dotClass: string;
  tasks: { id: number; title: string; due: string | null }[];
}) {
  const MAX_VISIBLE = 3;
  const visibleTasks = tasks.slice(0, MAX_VISIBLE);
  const remaining = tasks.length - visibleTasks.length;

  return (
    <div className="flex-1 min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="space-y-2">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-lg border bg-background p-3 text-sm shadow-sm"
          >
            <p className="font-medium">{task.title}</p>
            {task.due && (
              <p className="mt-1 text-xs text-muted-foreground">
                Due {task.due}
              </p>
            )}
          </div>
        ))}
        {remaining > 0 && (
          <p className="px-1 pt-1 text-xs text-muted-foreground">
            +{remaining} more
          </p>
        )}
      </div>
    </div>
  );
}

// --- Page --------------------------------------------------------------

const Dashboard = () => {
  const { createTask } = useTask();
  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        {/* <Button>
          <Plus className="h-4 w-4" />
          New Task
        </Button> */}

        <NewTask onCreate={createTask} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Task board preview — spans 2 cols on large screens */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Task Board</CardTitle>
              <CardDescription>Your active work at a glance</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <TaskColumn
                title="To Do"
                count={BOARD.todos.length}
                dotClass="bg-gray-400"
                tasks={BOARD.todos}
              />
              <TaskColumn
                title="In Progress"
                count={BOARD.inProgress.length}
                dotClass="bg-blue-500"
                tasks={BOARD.inProgress}
              />
              <TaskColumn
                title="Done"
                count={BOARD.done.length}
                dotClass="bg-green-500"
                tasks={BOARD.done}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming deadlines */}
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming
            </CardTitle>
            <CardDescription>Deadlines and events this week</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {UPCOMING.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.project}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.date}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full justify-center">
              View calendar
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project progress — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Progress across active projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PROJECTS.map((project) => (
              <div key={project.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${project.progress}%`,
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>What your team has been up to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ACTIVITY.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{item.user}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-sm">
                  <p className="truncate">
                    <span className="font-medium">{item.user}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
