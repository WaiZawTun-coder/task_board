"use client";

import { useProject } from "@/context/ProjectContext";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";
import { useApi } from "@/utilities/api";
import { ListChecks, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "./UI/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./UI/input-group";

const MAX_RESULTS = 5;

const GlobalSearch = ({ className = "" }: { className?: string }) => {
  const { projects } = useProject();
  const fetchApi = useApi();
  const router = useRouter();

  const [search, setSearch] = useState<string>("");
  const [isFocused, setIsFocued] = useState<boolean>(false);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [taskResults, setTaskResults] = useState<TaskType[]>([]);
  const [isSearchingTasks, setIsSearchingTasks] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToTasks = (query: string) => {
    const trimmed = query.trim();
    router.push(
      trimmed ? `/tasks?search=${encodeURIComponent(trimmed)}` : "/tasks",
    );
  };

  const goToProject = (projectId: number) => {
    router.push(`/projects/${projectId}`);
    setIsOpen(false);
  };

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

  const hasResults = matchingProjects.length > 0 || taskResults.length > 0;
  const showDropdown = isOpen && debouncedSearch !== "";

  const clear = () => {
    setSearch("");
  };

  useKeyboardShortcut({
    key: "/",
    callback: () => {
      inputRef.current?.focus();
    },
  });

  useKeyboardShortcut({
    key: "escape",
    callback: () => {
      inputRef.current?.blur();
    },
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <InputGroup className="min-w-64">
        <InputGroupInput
          placeholder="Search tasks and projects..."
          ref={inputRef}
          className="max-w-sm px-4 py-2 pl-4 border-0 focus-visible:ring-0 dark:bg-transparent"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsFocued(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goToTasks(search);
            } else if (e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          onBlur={() => {
            setIsOpen(false);
            setIsFocued(false);
          }}
        />
        <InputGroupAddon align="inline-start">
          <Search className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="hidden sm:block">
          {!isFocused && (
            <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">/</span>
            </kbd>
          )}
        </InputGroupAddon>
        {isFocused && (
          <InputGroupAddon align="inline-end">
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault(); // keep input focused
                clear();
              }}
            >
              <X />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

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
  );
};

export default GlobalSearch;
