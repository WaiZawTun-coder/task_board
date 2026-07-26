"use client";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/UI/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import NewTask from "@/components/newTask";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import TaskType from "@/lib/types/task";

import { TaskColumn } from "@/components/task-column";
import { DragDropProvider, DragEndEvent, DragOverlay } from "@dnd-kit/react";

type Stat = {
  label: string;
  value: number;
  icon: typeof ListTodo;
  accent: string;
};

const statusLabels = {
  pending: "To Do",
  on_going: "In Progress",
  cancel: "Cancelled",
} as const;

const getDueDate = (task: TaskType) => {
  if (!task.due) return null;
  const date = new Date(task.due);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDueDate = (task: TaskType) => {
  const date = getDueDate(task);
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const taskProjectId = (task: TaskType) =>
  task.projectId ?? (task as TaskType & { project_id?: number }).project_id;

function StatCard({ label, value, icon: Icon, accent }: Stat) {
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

export default function Dashboard() {
  const { tasks, createTask, updateTask } = useTask();
  const { projects, isProjectsLoading } = useProject();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "on_going");
  const cancelledTasks = tasks.filter((task) => task.status === "cancel");
  const overdueTasks = tasks.filter((task) => {
    const due = getDueDate(task);
    return due !== null && due < today && task.status !== "cancel";
  });
  const upcomingTasks = tasks
    .filter((task) => {
      const due = getDueDate(task);
      return due !== null && due >= today && task.status !== "cancel";
    })
    .sort((a, b) => getDueDate(a)!.getTime() - getDueDate(b)!.getTime())
    .slice(0, 4);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (event.canceled) return;

    const { source, target } = event.operation;
    if (!target) return;

    const newStatus = target.id as TaskType["status"];
    const task = (source?.data as { task?: TaskType } | undefined)?.task;
    if (!task || task.status === newStatus) return;

    try {
      await updateTask({
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        due: task.due,
        status: newStatus,
        priority: task.priority,
      });
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const stats: Stat[] = [
    {
      label: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      accent:
        "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      label: "To Do",
      value: pendingTasks.length,
      icon: CheckCircle2,
      accent:
        "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      label: "In Progress",
      value: inProgressTasks.length,
      icon: Clock,
      accent:
        "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    {
      label: "Overdue",
      value: overdueTasks.length,
      icon: AlertTriangle,
      accent: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your projects today.
          </p>
        </div>
        <NewTask onCreate={createTask} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Task Board</CardTitle>
            <CardDescription>Your active work at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropProvider onDragEnd={handleDragEnd}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <TaskColumn
                  status="pending"
                  title={statusLabels.pending}
                  dotClass="bg-gray-400"
                  tasks={pendingTasks}
                />
                <TaskColumn
                  status="on_going"
                  title={statusLabels.on_going}
                  dotClass="bg-blue-500"
                  tasks={inProgressTasks}
                />
                <TaskColumn
                  status="cancel"
                  title={statusLabels.cancel}
                  dotClass="bg-red-500"
                  tasks={cancelledTasks}
                />
              </div>
              <DragOverlay>
                {(source) => {
                  const task = (source?.data as { task?: TaskType })?.task;
                  return task ? (
                    <div className="rounded-lg border bg-background p-3 text-sm shadow-lg">
                      {task.title}
                    </div>
                  ) : null;
                }}
              </DragOverlay>
            </DragDropProvider>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Upcoming
            </CardTitle>
            <CardDescription>Tasks with the nearest due dates</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {upcomingTasks.length ? (
              upcomingTasks.map((task) => {
                const project = projects.find(
                  (item) => item.project_id === taskProjectId(task),
                );
                return (
                  <div
                    key={task.task_id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project?.title ?? "No project"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDueDate(task)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming tasks.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              {isProjectsLoading
                ? "Loading projects…"
                : `${projects.length} project${projects.length === 1 ? "" : "s"} in your workspace`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.length ? (
              projects.slice(0, 5).map((project) => {
                const projectTasks = tasks.filter(
                  (task) => taskProjectId(task) === project.project_id,
                );
                return (
                  <div key={project.project_id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: project.color_hex }}
                        />
                        <span className="truncate font-medium">
                          {project.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-muted-foreground">
                        {projectTasks.length} task
                        {projectTasks.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${tasks.length ? Math.round((projectTasks.length / tasks.length) * 100) : 0}%`,
                          backgroundColor: project.color_hex,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest tasks in your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length ? (
              tasks.slice(0, 4).map((task) => {
                const project = projects.find(
                  (item) => item.project_id === taskProjectId(task),
                );
                return (
                  <div key={task.task_id} className="flex items-start gap-3">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {task.title.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {project?.title ?? statusLabels[task.status]}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
