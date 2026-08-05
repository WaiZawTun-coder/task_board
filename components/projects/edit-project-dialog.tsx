"use client";

import { Loader2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import {
  PROJECT_STATUS_CONFIG,
  PROJECT_STATUS_ORDER,
} from "@/lib/project-config";
import ProjectType from "@/lib/types/project";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ColorPicker = dynamic(
  () => import("@/components/UI/color-picker").then((m) => m.ColorPicker),
  { ssr: false },
);

type EditProjectFormData = {
  title: string;
  description: string;
  color_hex: string;
  status: ProjectType["status"];
};

type EditProjectDialogProps = {
  project: ProjectType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    project_id: number;
    title: string;
    description: string;
    color_hex: string;
    status: ProjectType["status"];
  }) => Promise<{ success: boolean; message?: string }>;
};

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSave,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState<EditProjectFormData>({
    title: "",
    description: "",
    color_hex: "",
    status: "active",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!project) return;
    setFormData({
      title: project.title,
      description: project.description ?? "",
      color_hex: project.color_hex,
      status: project.status,
    });
    setError("");
  }, [project]);

  const handleChange = <K extends keyof EditProjectFormData>(
    key: K,
    value: EditProjectFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setError("");

    if (formData.title.trim() === "") {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSave({
        project_id: project.project_id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        color_hex: formData.color_hex,
        status: formData.status,
      });

      if (!result.success) {
        setError(result.message || "Unable to update project");
        return;
      }

      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update the project details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-project-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="edit-project-title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              aria-invalid={error !== ""}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-project-description"
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id="edit-project-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-sm font-medium"
                htmlFor="edit-project-color"
              >
                Color
              </label>
              <ColorPicker
                id="edit-project-color"
                value={formData.color_hex}
                onChange={(value) => handleChange("color_hex", value)}
                error={false}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    "w-full border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
                    "h-8 gap-1.5 px-2.5",
                    "flex flex-1 min-w-0 justify-start text-left font-normal",
                    "group/button cursor-pointer inline-flex shrink-0 items-center justify-start rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                  )}
                >
                  {PROJECT_STATUS_CONFIG[formData.status].label}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={formData.status}
                    onValueChange={(value) =>
                      handleChange("status", value as ProjectType["status"])
                    }
                  >
                    {PROJECT_STATUS_ORDER.map((status) => (
                      <DropdownMenuRadioItem key={status} value={status}>
                        {PROJECT_STATUS_CONFIG[status].label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  Saving... <Loader2 className="h-4 w-4 animate-spin" />
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
