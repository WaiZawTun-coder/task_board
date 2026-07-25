"use client";

import { Loader2, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "./UI/button";
import { ColorPicker } from "./UI/color-picker";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./UI/dialog";
import { Input } from "./UI/input";
import { Textarea } from "./UI/textarea";

type NewProjectFormData = {
  title: string;
  description: string;
  color_hex: string;
};

const INITIAL_FORM: NewProjectFormData = {
  title: "",
  description: "",
  color_hex: "",
};

type CreateProjectResult = {
  success: boolean;
  message?: string;
};

type NewProjectProps = {
  onCreate?: (
    data: NewProjectFormData,
  ) => Promise<void> | Promise<CreateProjectResult> | void;
};

const NewProject = ({ onCreate }: NewProjectProps) => {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewProjectFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorTarget, setErrorTarget] = useState<string[]>([]);

  const handleChange = <K extends keyof NewProjectFormData>(
    key: K,
    value: NewProjectFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    if (isSubmitting) return;

    e.preventDefault();
    setError("");
    setErrorTarget([]);

    const errors = [];

    if (formData.title.trim() === "") {
      errors.push("Title");
      setErrorTarget((prev) => {
        const newArray = [...prev];
        if (newArray.includes("title")) {
          return newArray;
        }

        newArray.push("title");

        return newArray;
      });
    }

    if (formData.color_hex.trim() === "") {
      errors.push("Project color");
      setErrorTarget((prev) => {
        const newArray = [...prev];
        if (newArray.includes("color_hex")) {
          return newArray;
        }

        newArray.push("color_hex");

        return newArray;
      });
    }

    if (errors.length > 0) {
      setError(
        `${errors.join(", ")} ${errors.length > 1 ? "are" : "is"} required`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result: CreateProjectResult | void = await onCreate?.({
        ...formData,
        title: formData.title.trim(),
        color_hex: formData.color_hex.trim(),
        description: formData.description.trim(),
      });

      if (result && !result.success) {
        setError(result.message || "Something went wrong");
        return;
      } else handleOpenChange(false);

      resetForm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="ghost"
        size="default"
        onClick={() => handleOpenChange(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project into your project list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor={`${formId}_title`} className="text-sm font-medium">
              Title
            </label>
            <Input
              id={`${formId}_title`}
              placeholder="e.g. New Project"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              aria-invalid={errorTarget.includes("title")}
            ></Input>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={`${formId}_description`}
              className="text-sm font-medium"
            >
              Description
            </label>
            <Textarea
              id={`${formId}_description`}
              placeholder="Add more details (optional)"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor={`${formId}_color`} className="text-sm font-medium">
              Project Color
            </label>
            <ColorPicker
              id={`${formId}_color`}
              value={formData.color_hex}
              onChange={(e) => handleChange("color_hex", e)}
              className="w-full"
              error={errorTarget.includes("color_hex")}
            />
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
                  Creating... <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProject;
