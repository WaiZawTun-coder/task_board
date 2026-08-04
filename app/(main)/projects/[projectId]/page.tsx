"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FolderKanban } from "lucide-react";

import { Button } from "@/components/UI/button";
import NewTask from "@/components/newTask";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { SortOption, StatusFilter } from "@/components/tasks/task-filters";
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { EditProjectDialog } from "@/components/projects/edit-project-dialog";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectProgressBar } from "@/components/projects/project-progress-bar";
import { ProjectStatsCards } from "@/components/projects/project-stats-cards";
import { ProjectTaskFilters } from "@/components/projects/project-task-filters";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { useTasksQuery } from "@/hooks/useTasksQuery";
import TaskType from "@/lib/types/task";

const PAGE_SIZE = 10;

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = Number(params.projectId);
  const isValidId = Number.isInteger(projectId) && projectId > 0;

  const { updateProject, deleteProject } = useProject();
  const { createTask, updateTask, deleteTask } = useTask();
  const { project, isLoading, notFound, error, loadProject } =
    useProjectDetail();
  const {
    tasks,
    pagination,
    isLoading: tasksLoading,
    fetchTasks,
  } = useTasksQuery();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priorities, setPriorities] = useState<TaskType["priority"][]>([]);
  const [sort, setSort] = useState<SortOption>("due_asc");
  const [page, setPage] = useState(1);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || priorities.length > 0;

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriorities([]);
  };

  useEffect(() => {
    if (!isValidId) return;
    void loadProject(projectId);
  }, [projectId, isValidId, loadProject]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const id = setTimeout(() => setPage(1));

    clearTimeout(id);
  }, [debouncedSearch, status, priorities, sort]);

  const runTasksQuery = useCallback(
    () =>
      fetchTasks({
        project_id: projectId,
        search: debouncedSearch,
        status,
        priorities,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, fetchTasks, page, priorities, projectId, sort, status],
  );

  useEffect(() => {
    if (!isValidId) return;
    void runTasksQuery();
  }, [
    projectId,
    isValidId,
    debouncedSearch,
    status,
    priorities,
    sort,
    page,
    runTasksQuery,
  ]);

  const refreshAll = async () => {
    await Promise.all([loadProject(projectId), runTasksQuery()]);
  };

  const handleStatusChange = async (
    task: TaskType,
    newStatus: TaskType["status"],
  ) => {
    if (task.status === newStatus) return;
    try {
      await updateTask({
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        due: task.due,
        status: newStatus,
        priority: task.priority,
      });
      await refreshAll();
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDeleteTask = async (task: TaskType) => {
    try {
      await deleteTask({ task_id: task.task_id });
      await refreshAll();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    // this page is scoped to a single project, so new tasks are always
    // attached to it, overriding whatever's selected in the dialog's
    // own project picker
    const result = await createTask({ ...data, project_id: projectId });
    if (result.success) await refreshAll();
    return result;
  };

  const handleSaveTask = async (data: Parameters<typeof updateTask>[0]) => {
    const result = await updateTask(data);
    if (result.success) await refreshAll();
    return result;
  };

  const handleSaveProject = async (
    data: Parameters<typeof updateProject>[0],
  ) => {
    const result = await updateProject(data);
    if (result.success) await loadProject(projectId);
    return result;
  };

  const handleDeleteProject = async () => {
    const result = await deleteProject({ project_id: projectId });
    if (result.success) router.push("/dashboard");
    return result;
  };

  if (!isValidId || notFound) {
    return (
      <div className="flex min-w-full flex-col items-center justify-center gap-3 p-12 text-center">
        <FolderKanban className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Project not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This project doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  if (isLoading && !project) {
    return (
      <div className="min-w-full space-y-6 p-4 sm:p-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-w-full flex-col items-center justify-center gap-3 p-12 text-center">
        <p className="text-sm text-destructive">
          {error || "Unable to load this project."}
        </p>
        <Button variant="outline" onClick={() => loadProject(projectId)}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <ProjectHeader
        project={project}
        onEdit={() => setEditingProject(true)}
        onDelete={() => setDeletingProject(true)}
      />

      <ProjectStatsCards stats={project.stats} />

      <ProjectProgressBar stats={project.stats} />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {tasksLoading
              ? "Loading tasks…"
              : `${pagination.total} task${pagination.total === 1 ? "" : "s"} in this project`}
          </p>
        </div>
        <NewTask
          onCreate={handleCreateTask}
          triggerLabel="New Task"
          selectedProject={projectId}
        />
      </div>

      <ProjectTaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priorities={priorities}
        onPrioritiesChange={setPriorities}
        sort={sort}
        onSortChange={setSort}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <TaskList
        tasks={tasks}
        projects={[project]}
        onStatusChange={handleStatusChange}
        onEdit={setEditingTask}
        onDelete={handleDeleteTask}
      />

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || tasksLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || tasksLoading}
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={handleSaveTask}
      />

      <EditProjectDialog
        project={project}
        open={editingProject}
        onOpenChange={setEditingProject}
        onSave={handleSaveProject}
      />

      <DeleteProjectDialog
        project={project}
        open={deletingProject}
        onOpenChange={setDeletingProject}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}
