"use client";

import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { Calendar } from "@/components/UI/calendar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/UI/combobox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import { TimePicker } from "@/components/time-picker";
import { cn } from "@/lib/utils";
import ProjectType from "@/lib/types/project";

type NewTaskFieldsProps = {
  projects: ProjectType[];
  isProjectsLoading: boolean;
  selectedProject: number | undefined;
  projectId: number | undefined;
  due: Date | undefined;
  onProjectChange: (projectId: number | undefined) => void;
  onDateSelect: (date: Date | undefined) => void;
  onTimeChange: (value: { hour: number; minute: number }) => void;
};

export function NewTaskFields({
  projects,
  isProjectsLoading,
  selectedProject,
  projectId,
  due,
  onProjectChange,
  onDateSelect,
  onTimeChange,
}: NewTaskFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor="task-project" className="text-sm font-medium">
          Project
        </label>
        <Combobox
          value={
            selectedProject
              ? projects.filter((p) => p.project_id === selectedProject)[0]
                  ?.title
              : undefined
          }
          items={projects.map((project) => project.title)}
          onValueChange={(item) =>
            onProjectChange(
              projects.filter((p) => p.title === item)[0]?.project_id,
            )
          }
        >
          <ComboboxInput placeholder="Select a project" />
          <ComboboxContent>
            {isProjectsLoading && (
              <ComboboxList>
                <ComboboxItem>
                  Loading... <Loader2 className="h-4 w-4 animate-spin" />
                </ComboboxItem>
              </ComboboxList>
            )}
            <ComboboxEmpty className="flex flex-col">
              No items found
            </ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="task-due-date" className="text-sm font-medium">
          Due date
        </label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger
              className={cn(
                "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                "flex flex-1 min-w-0 justify-start text-left font-normal",
                "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                !due && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">
                {due ? format(due, "PPP") : "Pick a date"}
              </span>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={due}
                onSelect={onDateSelect}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>

          <TimePicker
            hour={due?.getHours()}
            minute={due?.getMinutes()}
            onChange={onTimeChange}
          />
        </div>
      </div>
    </>
  );
}
