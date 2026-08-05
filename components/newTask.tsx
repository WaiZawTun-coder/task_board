"use client";

import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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
import { useProject } from "@/context/ProjectContext";
import dynamic from "next/dynamic";

const NewTaskFields = dynamic(
  () => import("./newTaskFields").then((m) => m.NewTaskFields),
  {
    ssr: false,
    loading: () => <div className="h-32 animate-pulse rounded-lg bg-muted" />,
  },
);

type NewTaskFormData = {
  title: string;
  description: string;
  due: Date | undefined;
  project_id: number | undefined;
};

const INITIAL_FORM: NewTaskFormData = {
  title: "",
  description: "",
  due: undefined,
  project_id: undefined,
};

type NewTaskProps = {
  onCreate?: (
    data: NewTaskFormData,
  ) => Promise<void> | Promise<{ success: boolean; message?: string }> | void;
  triggerLabel?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  triggerSize?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  selectedProject?: number | undefined;
};

const NewTask = ({
  onCreate,
  triggerLabel = "New Task",
  triggerVariant = "default",
  triggerSize = "lg",
  className,
  selectedProject = undefined,
}: NewTaskProps) => {
  const { projects, isProjectsLoading } = useProject();
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

  useEffect(() => {
    if (selectedProject) {
      setFormData((prev) => ({ ...prev, project_id: selectedProject }));
    }
  }, [selectedProject]);

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

          {open && (
            <NewTaskFields
              projects={projects}
              isProjectsLoading={isProjectsLoading}
              selectedProject={selectedProject}
              projectId={formData.project_id}
              due={formData.due}
              onProjectChange={(id) => handleChange("project_id", id)}
              onDateSelect={handleDateSelect}
              onTimeChange={({ hour, minute }) => {
                setFormData((prev) => {
                  const base = prev.due ? new Date(prev.due) : new Date();
                  base.setHours(hour, minute, 0, 0);
                  return { ...prev, due: base };
                });
              }}
            />
          )}

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
