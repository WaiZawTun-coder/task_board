"use client";

import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/UI/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/UI/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { SearchIcon } from "lucide-react";
import ProjectType from "@/lib/types/project";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | TaskType["status"];
export type SortOption = "due_asc" | "due_desc" | "priority_desc" | "title_asc";

const PRIORITIES: TaskType["priority"][] = ["low", "medium", "high"];

const SORT_LABELS: Record<SortOption, string> = {
  due_asc: "Due date (soonest)",
  due_desc: "Due date (latest)",
  priority_desc: "Priority (high to low)",
  title_asc: "Title (A-Z)",
};

type TaskFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priorities: TaskType["priority"][];
  onPrioritiesChange: (value: TaskType["priority"][]) => void;
  projectId: number | undefined;
  onProjectIdChange: (value: number | undefined) => void;
  projects: ProjectType[];
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function TaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priorities,
  onPrioritiesChange,
  projectId,
  onProjectIdChange,
  projects,
  sort,
  onSortChange,
  onClear,
  hasActiveFilters,
}: TaskFiltersProps) {
  const togglePriority = (priority: TaskType["priority"]) => {
    onPrioritiesChange(
      priorities.includes(priority)
        ? priorities.filter((p) => p !== priority)
        : [...priorities, priority],
    );
  };

  const selectedProject = projects.find((p) => p.project_id === projectId);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <InputGroup className="sm:max-w-xs">
        <InputGroupInput
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon className="h-4 w-4 opacity-50" />
        </InputGroupAddon>
      </InputGroup>

      <Tabs
        value={status}
        onValueChange={(value) => onStatusChange(value as StatusFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">To Do</TabsTrigger>
          <TabsTrigger value="on_going">In Progress</TabsTrigger>
          <TabsTrigger value="cancel">Cancelled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
              "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
              "flex flex-1 min-w-fit items-center justify-start text-left font-normal",
              "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            {/* <Button variant="outline" size="sm"> */}
            <SlidersHorizontal className="h-4 w-4" />
            Priority{priorities.length > 0 ? ` (${priorities.length})` : ""}
            {/* </Button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRIORITIES.map((priority) => (
                <DropdownMenuCheckboxItem
                  key={priority}
                  checked={priorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                >
                  {priority[0].toUpperCase() + priority.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
              "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
              "flex flex-1 min-w-fit justify-start text-left font-normal",
              "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            {/* <Button variant="outline" size="sm"> */}
            {selectedProject ? selectedProject.title : "Project"}
            {/* </Button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Filter by project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={projectId !== undefined ? String(projectId) : "all"}
                onValueChange={(value) =>
                  onProjectIdChange(value === "all" ? undefined : Number(value))
                }
              >
                <DropdownMenuRadioItem value="all">
                  All projects
                </DropdownMenuRadioItem>
                {projects.map((project) => (
                  <DropdownMenuRadioItem
                    key={project.project_id}
                    value={String(project.project_id)}
                  >
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color_hex }}
                    />
                    {project.title}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
              "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
              "flex flex-1 min-w-fit justify-start text-left font-normal",
              "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            )}
          >
            {/* <Button variant="outline" size="sm"> */}
            Sort: {SORT_LABELS[sort]}
            {/* </Button> */}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={sort}
              onValueChange={(value) => onSortChange(value as SortOption)}
            >
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {SORT_LABELS[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
