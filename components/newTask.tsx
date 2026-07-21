"use client";

import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./UI/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./UI/popover";
import { TimePicker } from "./time-picker";

type NewTaskFormData = {
  title: string;
  description: string;
  due: Date | undefined;
};

const INITIAL_FORM: NewTaskFormData = {
  title: "",
  description: "",
  due: undefined,
};

type NewTaskProps = {
  onCreate?: (
    data: NewTaskFormData,
  ) => Promise<void> | Promise<{ success: boolean; message?: string }> | void;
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  className?: string;
};

const NewTask = ({
  onCreate,
  triggerLabel = "New Task",
  triggerVariant = "default",
  triggerSize = "lg",
  className,
}: NewTaskProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewTaskFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = <K extends keyof NewTaskFormData>(
    key: K,
    value: NewTaskFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Merge a new date while preserving whatever time was already set
  // (defaults to 09:00 the first time a date is picked).
  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      handleChange("due", undefined);
      return;
    }

    setFormData((prev) => {
      const merged = new Date(newDate);
      if (prev.due) {
        merged.setHours(prev.due.getHours(), prev.due.getMinutes(), 0, 0);
      } else {
        merged.setHours(0, 0, 0, 0);
      }
      return { ...prev, due: merged };
    });
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.title.trim() === "") {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result: { success: boolean; message?: string } | void =
        await onCreate?.(formData);

      if (result && !result.success) {
        setError(result.message || "");
        return;
      } else setOpen(false);
      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
          <DialogDescription>
            Add a task to your board. You can edit the details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="task-title"
              placeholder="e.g. Review pull request"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              aria-invalid={error !== ""}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="Add more details (optional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
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
                    disabled={(date) => date < new Date()}
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
                  Creating...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Create task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTask;
