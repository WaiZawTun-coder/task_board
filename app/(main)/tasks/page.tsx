"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react";

import NewTask from "@/components/newTask";
import { Button } from "@/components/UI/button";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import {
  TaskFilters,
  StatusFilter,
  SortOption,
} from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import { useTasksQuery } from "@/hooks/useTasksQuery";
import TaskType from "@/lib/types/task";

const PAGE_SIZE = 10;

export default function AllTasksPage() {
  const searchParams = useSearchParams();

  const { createTask, updateTask, deleteTask } = useTask();
  const { projects } = useProject();
  const { tasks, pagination, isLoading, fetchTasks } = useTasksQuery();

  const initialSearch = searchParams.get("search")?.trim() ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priorities, setPriorities] = useState<TaskType["priority"][]>([]);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SortOption>("due_asc");
  const [page, setPage] = useState(1);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    priorities.length > 0 ||
    projectId !== undefined;

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriorities([]);
    setProjectId(undefined);
  };

  // keep the search box in sync if the user comes from the header search
  // again while already on this page (client-side navigation won't remount)
  useEffect(() => {
    const id = setTimeout(() =>
      setSearch(searchParams.get("search")?.trim() ?? ""),
    );

    clearTimeout(id);
  }, [searchParams]);

  // debounce the raw search input so we don't hit the API on every keystroke
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // any filter change should jump back to page 1
  useEffect(() => {
    const id = setTimeout(() => setPage(1));

    clearTimeout(id);
  }, [debouncedSearch, status, priorities, projectId, sort]);

  const runQuery = useCallback(
    () =>
      fetchTasks({
        search: debouncedSearch,
        status,
        priorities,
        project_id: projectId,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
    [debouncedSearch, fetchTasks, page, priorities, projectId, sort, status],
  );

  useEffect(() => {
    void runQuery();
  }, [debouncedSearch, status, priorities, projectId, sort, page, runQuery]);

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
      await runQuery();
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDelete = async (task: TaskType) => {
    try {
      await deleteTask({ task_id: task.task_id });
      await runQuery();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleCreate = async (data: Parameters<typeof createTask>[0]) => {
    const result = await createTask(data);
    if (result.success) await runQuery();
    return result;
  };

  const handleSave = async (data: Parameters<typeof updateTask>[0]) => {
    const result = await updateTask(data);
    if (result.success) await runQuery();
    return result;
  };

  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <ListChecks className="h-6 w-6" />
            All Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Loading tasks…"
              : `${pagination.total} task${pagination.total === 1 ? "" : "s"} found`}
          </p>
        </div>
        <NewTask onCreate={handleCreate} />
      </div>

      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priorities={priorities}
        onPrioritiesChange={setPriorities}
        projectId={projectId}
        onProjectIdChange={setProjectId}
        projects={projects}
        sort={sort}
        onSortChange={setSort}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <TaskList
        tasks={tasks}
        projects={projects}
        onStatusChange={handleStatusChange}
        onEdit={setEditingTask}
        onDelete={handleDelete}
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
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isLoading}
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
        onSave={handleSave}
      />
    </div>
  );
}
