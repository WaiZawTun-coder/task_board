"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, ListChecks, Loader2 } from "lucide-react";
import { useTask } from "@/context/TaskContext";
import { useProject } from "@/context/ProjectContext";
import { useApi } from "@/utilities/api";
import TaskType from "@/lib/types/task";
import NewTask from "../newTask";
import { ThemeToggle } from "../themeToggler";
import { Input } from "../UI/input";
import NotificationHeader from "./notification-header";
import ProfileHeader from "./profile-header";

const MAX_RESULTS = 5;

const DashboardHeader = () => {
  const { createTask } = useTask();
  const { projects } = useProject();
  const fetchApi = useApi();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [taskResults, setTaskResults] = useState<TaskType[]>([]);
  const [isSearchingTasks, setIsSearchingTasks] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const matchingProjects = debouncedSearch
    ? projects
        .filter((project) =>
          project.title.toLowerCase().includes(debouncedSearch.toLowerCase()),
        )
        .slice(0, MAX_RESULTS)
    : [];

  // debounce the raw input before filtering projects / hitting the tasks API
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  // look up matching tasks whenever the debounced term changes
  useEffect(() => {
    if (!debouncedSearch) {
      const id = setTimeout(() => {
        setTaskResults([]);
      }, 0);

      clearTimeout(id);
      return;
    }

    let alive = true;
    const id = setTimeout(() => {
      setIsSearchingTasks(true);
    });

    clearTimeout(id);

    fetchApi<{ success: boolean; data: TaskType[] }>(
      `/api/protected/tasks?search=${encodeURIComponent(debouncedSearch)}&limit=${MAX_RESULTS}`,
    )
      .then((res) => {
        if (alive && res.success) setTaskResults(res.data || []);
      })
      .catch(() => {
        if (alive) setTaskResults([]);
      })
      .finally(() => {
        if (alive) setIsSearchingTasks(false);
      });

    return () => {
      alive = false;
    };
  }, [debouncedSearch, fetchApi]);

  // close the dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToTasks = (query: string) => {
    const trimmed = query.trim();
    router.push(
      trimmed ? `/tasks?search=${encodeURIComponent(trimmed)}` : "/tasks",
    );
    setIsOpen(false);
  };

  const goToProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
    setIsOpen(false);
  };

  const hasResults = matchingProjects.length > 0 || taskResults.length > 0;
  const showDropdown = isOpen && debouncedSearch !== "";

  return (
    <header className="border-b">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 fixed top-0 w-full bg-background pl-10 md:pl-6">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
            TaskBoard
          </span>
        </div>
        {/* Search: hidden on mobile, visible from sm up */}
        <div ref={containerRef} className="w-full relative hidden sm:block">
          <Input
            placeholder="Search tasks and projects..."
            className="max-w-sm px-4 py-2"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToTasks(search);
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
          />

          {showDropdown && (
            <div className="absolute top-full left-0 z-100 mt-1 w-80 max-w-sm rounded-lg border bg-popover p-1.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
              {isSearchingTasks && (
                <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching…
                </div>
              )}

              {!isSearchingTasks && !hasResults && (
                <p className="px-2 py-3 text-xs text-muted-foreground">
                  No matching tasks or projects.
                </p>
              )}

              {matchingProjects.length > 0 && (
                <div className="mb-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Projects
                  </p>
                  {matchingProjects.map((project) => (
                    <button
                      key={project.project_id}
                      type="button"
                      onClick={() => goToProject(project.project_id)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: project.color_hex }}
                      />
                      <span className="truncate">{project.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {taskResults.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                    Tasks
                  </p>
                  {taskResults.map((task) => (
                    <button
                      key={task.task_id}
                      type="button"
                      onClick={() => goToTasks(task.title)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                    >
                      <ListChecks className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{task.title}</span>
                    </button>
                  ))}
                </div>
              )}

              {hasResults && (
                <button
                  type="button"
                  onClick={() => goToTasks(search)}
                  className="mt-1 flex w-full items-center gap-2 rounded-md border-t px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  See all results for &quot;{search.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-4">
          <ThemeToggle />

          <NewTask onCreate={createTask} />

          <NotificationHeader />
          <ProfileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
