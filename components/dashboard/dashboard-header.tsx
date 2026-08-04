"use client";

import { useTask } from "@/context/TaskContext";
import { Layout } from "lucide-react";
import NewTask from "../newTask";
import Search from "../search";
import { ThemeToggle } from "../themeToggler";
import NotificationHeader from "./notification-header";
import ProfileHeader from "./profile-header";
import { useParams } from "next/navigation";

const DashboardHeader = () => {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const isValidId = Number.isInteger(projectId) && projectId > 0;

  const { createTask } = useTask();

  // debounce the raw input before filtering projects / hitting the tasks API

  return (
    <header className="border-b md:z-50">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 fixed top-0 w-full bg-background pl-10 md:pl-6">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
            TaskBoard
          </span>
        </div>
        <Search className="w-56 hidden sm:block" />
        {/* Search: hidden on mobile, visible from sm up */}
        {/* <div ref={containerRef} className="w-full relative hidden sm:block">
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
        </div> */}

        <div className="ml-auto flex items-center gap-1 sm:gap-4">
          <ThemeToggle />

          <NewTask
            onCreate={createTask}
            selectedProject={isValidId ? projectId : undefined}
          />

          <NotificationHeader />
          <ProfileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
