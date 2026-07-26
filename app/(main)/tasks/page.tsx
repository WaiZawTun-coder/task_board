"use client";

import { useMemo, useState } from "react";
import { ListChecks } from "lucide-react";

import NewTask from "@/components/newTask";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import {
  TaskFilters,
  StatusFilter,
  SortOption,
} from "@/components/tasks/task-filters";
import { TaskList } from "@/components/tasks/task-list";
import { useProject } from "@/context/ProjectContext";
import { useTask } from "@/context/TaskContext";
import TaskType from "@/lib/types/task";

const getDueTime = (task: TaskType) => {
  if (!task.due) return null;
  const date = new Date(task.due);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const priorityWeight: Record<TaskType["priority"], number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const taskProjectId = (task: TaskType) =>
  task.projectId ?? (task as TaskType & { project_id?: number }).project_id;

export default function AllTasksPage() {
  const { tasks, createTask, updateTask, deleteTask } = useTask();
  const { projects } = useProject();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priorities, setPriorities] = useState<TaskType["priority"][]>([]);
  const [projectId, setProjectId] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<SortOption>("due_asc");
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

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (status !== "all" && task.status !== status) return false;
      if (priorities.length > 0 && !priorities.includes(task.priority))
        return false;
      if (projectId !== undefined && taskProjectId(task) !== projectId)
        return false;
      if (
        term &&
        !task.title.toLowerCase().includes(term) &&
        !task.description?.toLowerCase().includes(term)
      )
        return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "due_asc": {
          const aDue = getDueTime(a);
          const bDue = getDueTime(b);
          if (aDue === null && bDue === null) return 0;
          if (aDue === null) return 1;
          if (bDue === null) return -1;
          return aDue - bDue;
        }
        case "due_desc": {
          const aDue = getDueTime(a);
          const bDue = getDueTime(b);
          if (aDue === null && bDue === null) return 0;
          if (aDue === null) return 1;
          if (bDue === null) return -1;
          return bDue - aDue;
        }
        case "priority_desc":
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        case "title_asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [tasks, search, status, priorities, projectId, sort]);

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
    } catch (err) {
      console.error("Failed to update task status", err);
    }
  };

  const handleDelete = async (task: TaskType) => {
    try {
      await deleteTask({ task_id: task.task_id });
    } catch (err) {
      console.error("Failed to delete task", err);
    }
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
            {filteredTasks.length} of {tasks.length} task
            {tasks.length === 1 ? "" : "s"} shown
          </p>
        </div>
        <NewTask onCreate={createTask} />
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
        tasks={filteredTasks}
        projects={projects}
        onStatusChange={handleStatusChange}
        onEdit={setEditingTask}
        onDelete={handleDelete}
      />

      <EditTaskDialog
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSave={updateTask}
      />
    </div>
  );
}
