"use client";

import { SearchIcon, SlidersHorizontal, X } from "lucide-react";

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
import { SortOption, StatusFilter } from "@/components/tasks/task-filters";
import TaskType from "@/lib/types/task";
import { cn } from "@/lib/utils";

const PRIORITIES: TaskType["priority"][] = ["low", "medium", "high"];

const SORT_LABELS: Record<SortOption, string> = {
  due_asc: "Due date (soonest)",
  due_desc: "Due date (latest)",
  priority_desc: "Priority (high to low)",
  title_asc: "Title (A-Z)",
};

type ProjectTaskFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priorities: TaskType["priority"][];
  onPrioritiesChange: (value: TaskType["priority"][]) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function ProjectTaskFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priorities,
  onPrioritiesChange,
  sort,
  onSortChange,
  onClear,
  hasActiveFilters,
}: ProjectTaskFiltersProps) {
  const togglePriority = (priority: TaskType["priority"]) => {
    onPrioritiesChange(
      priorities.includes(priority)
        ? priorities.filter((p) => p !== priority)
        : [...priorities, priority],
    );
  };

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
              "h-8 gap-1.5 px-2.5",
              "flex flex-1 min-w-fit items-center justify-start text-left font-normal",
              "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Priority{priorities.length > 0 ? ` (${priorities.length})` : ""}
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
              "h-8 gap-1.5 px-2.5",
              "flex flex-1 min-w-fit justify-start text-left font-normal",
              "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            Sort: {SORT_LABELS[sort]}
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
