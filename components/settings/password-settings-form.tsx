"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { useNotification } from "@/context/NotificationContext";
import { useApi } from "@/utilities/api";

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const INITIAL_FORM: PasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function PasswordSettingsForm() {
  const fetchApi = useApi();
  const { notify } = useNotification();

  const [formData, setFormData] = useState<PasswordFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = <K extends keyof PasswordFormData>(
    key: K,
    value: PasswordFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.currentPassword.trim() === "") {
      setError("Current password is required");
      return;
    }

    if (formData.newPassword.trim().length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (formData.newPassword.trim() !== formData.confirmPassword.trim()) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: { success: boolean; message?: string; error?: string } =
        await fetchApi("/api/protected/user/password", {
          method: "PUT",
          body: {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          },
        });

      if (!data.success) {
        setError(data.message || data.error || "Unable to update password");
        return;
      }

      setFormData(INITIAL_FORM);
      notify(
        "Password updated",
        "Your password has been changed. You'll need to sign in again on other devices.",
        "success",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { error?: string })?.error || "Unable to update password";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change the password used to sign in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="settings-current-password"
              className="text-sm font-medium"
            >
              Current password
            </label>
            <Input
              id="settings-current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              aria-invalid={error !== ""}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="settings-new-password"
                className="text-sm font-medium"
              >
                New password
              </label>
              <Input
                id="settings-new-password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                aria-invalid={error !== ""}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="settings-confirm-password"
                className="text-sm font-medium"
              >
                Confirm new password
              </label>
              <Input
                id="settings-confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                aria-invalid={error !== ""}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  Updating...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Update password
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
