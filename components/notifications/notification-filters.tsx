"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/UI/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { cn } from "@/lib/utils";
import NotificationType from "@/lib/types/notification";

export type ReadFilter = "all" | "unread" | "read";
export type TypeFilter = "all" | NotificationType["type"];

type NotificationFiltersProps = {
  status: ReadFilter;
  onStatusChange: (value: ReadFilter) => void;
  type: TypeFilter;
  onTypeChange: (value: TypeFilter) => void;
};

const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All types",
  info: "Info",
  success: "Success",
  error: "Error",
};

export function NotificationFilters({
  status,
  onStatusChange,
  type,
  onTypeChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={status}
        onValueChange={(value) => onStatusChange(value as ReadFilter)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "w-fit border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            "h-8 gap-1.5 px-2.5",
            "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {TYPE_LABELS[type]}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter by type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={type}
              onValueChange={(value) => onTypeChange(value as TypeFilter)}
            >
              {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {TYPE_LABELS[option]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
