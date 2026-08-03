"use client";

import { useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useApi } from "@/utilities/api";

export function DangerZone() {
  const router = useRouter();
  const fetchApi = useApi();

  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);
    try {
      const data: { success: boolean; message?: string; error?: string } =
        await fetchApi("/api/protected/user", { method: "DELETE" });

      if (!data.success) {
        setError(data.message || data.error || "Unable to delete account");
        return;
      }

      router.replace("/login");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { error?: string })?.error || "Unable to delete account";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-destructive" />
              Delete account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account, projects, and tasks.
              This cannot be undone.
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
              onClick={handleDelete}
            >
              {isDeleting ? (
                <>
                  Deleting... <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                "Delete account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
