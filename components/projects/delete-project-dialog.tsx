"use client";

import { Loader2, TriangleAlert } from "lucide-react";
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
import ProjectType from "@/lib/types/project";

type DeleteProjectDialogProps = {
  project: ProjectType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<{ success: boolean; message?: string }>;
};

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setIsDeleting(true);
    try {
      const result = await onConfirm();
      if (!result.success) {
        setError(result.message || "Unable to delete project");
        return;
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 text-destructive" />
            Delete project
          </DialogTitle>
          <DialogDescription>
            {project
              ? `Delete "${project.title}"? This cannot be undone.`
              : "This cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-xs font-medium text-destructive">{error}</p>
        )}

        <DialogFooter>
          <DialogClose
            render={<Button type="button" variant="outline" />}
            disabled={isDeleting}
          >
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? (
              <>
                Deleting... <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Delete project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
