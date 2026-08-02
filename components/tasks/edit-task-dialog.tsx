"use client";

import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Button } from "@/components/UI/button";
import { Calendar } from "@/components/UI/calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Input } from "@/components/UI/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/UI/popover";
import { Textarea } from "@/components/UI/textarea";
import { TimePicker } from "@/components/time-picker";
import { cn } from "@/lib/utils";
import TaskType from "@/lib/types/task";

const STATUS_LABELS: Record<TaskType["status"], string> = {
  pending: "To Do",
  on_going: "In Progress",
  cancel: "Cancelled",
  completed: "Completed",
};

const PRIORITY_LABELS: Record<TaskType["priority"], string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

type EditTaskFormData = {
  title: string;
  description: string;
  due: Date | undefined;
  status: TaskType["status"];
  priority: TaskType["priority"];
};

type EditTaskDialogProps = {
  task: TaskType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    task_id: number;
    title: string;
    description: string;
    due: Date;
    status: TaskType["status"];
    priority: TaskType["priority"];
  }) => Promise<{ success: boolean; message?: string }>;
};

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSave,
}: EditTaskDialogProps) {
  const [formData, setFormData] = useState<EditTaskFormData>({
    title: "",
    description: "",
    due: undefined,
    status: "pending",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!task) return;
    setFormData({
      title: task.title,
      description: task.description ?? "",
      due: task.due ? new Date(task.due) : undefined,
      status: task.status,
      priority: task.priority,
    });
    setError("");
  }, [task]);

  const handleChange = <K extends keyof EditTaskFormData>(
    key: K,
    value: EditTaskFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      handleChange("due", undefined);
      return;
    }
    setFormData((prev) => {
      const merged = new Date(newDate);
      if (prev.due)
        merged.setHours(prev.due.getHours(), prev.due.getMinutes(), 0, 0);
      else merged.setHours(9, 0, 0, 0);
      return { ...prev, due: merged };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    setError("");

    if (formData.title.trim() === "") {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSave({
        task_id: task.task_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        due: formData.due ?? new Date(),
        status: formData.status,
        priority: formData.priority,
      });

      if (!result.success) {
        setError(result.message || "Unable to update task");
        return;
      }

      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>Update the task details below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-task-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-task-title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              aria-invalid={error !== ""}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-task-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="edit-task-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                    "flex flex-1 min-w-0 justify-start text-left font-normal",
                    "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    !formData.due && "text-muted-foreground",
                  )}
                >
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  > */}
                  {STATUS_LABELS[formData.status]}
                  {/* </Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange("status", value as TaskType["status"])
                    }
                  >
                    {(Object.keys(STATUS_LABELS) as TaskType["status"][]).map(
                      (status) => (
                        <DropdownMenuRadioItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </DropdownMenuRadioItem>
                      ),
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                    "flex flex-1 min-w-0 justify-start text-left font-normal",
                    "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    !formData.due && "text-muted-foreground",
                  )}
                >
                  {/* <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                  > */}
                  {PRIORITY_LABELS[formData.priority]}
                  {/* </Button> */}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={formData.priority}
                    onValueChange={(value) =>
                      handleChange("priority", value as TaskType["priority"])
                    }
                  >
                    {(
                      Object.keys(PRIORITY_LABELS) as TaskType["priority"][]
                    ).map((priority) => (
                      <DropdownMenuRadioItem key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Due date</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                    "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
                    "flex flex-1 min-w-0 justify-start text-left font-normal",
                    "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    !formData.due && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {formData.due ? format(formData.due, "PPP") : "Pick a date"}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.due}
                    onSelect={handleDateSelect}
                  />
                </PopoverContent>
              </Popover>

              <TimePicker
                hour={formData.due?.getHours()}
                minute={formData.due?.getMinutes()}
                onChange={({ hour, minute }) => {
                  setFormData((prev) => {
                    const base = prev.due ? new Date(prev.due) : new Date();
                    base.setHours(hour, minute, 0, 0);
                    return { ...prev, due: base };
                  });
                }}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}

          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="outline" />}
              disabled={isSubmitting}
            >
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Saving...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
