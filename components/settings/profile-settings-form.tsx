"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { validateEmail } from "@/lib/validate";
import { useApi } from "@/utilities/api";

type ProfileFormData = {
  username: string;
  email: string;
};

export function ProfileSettingsForm() {
  const { user, updateUser } = useAuth();
  const fetchApi = useApi();
  const { notify } = useNotification();

  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setFormData({ username: user.username, email: user.email });
  }, [user]);

  const handleChange = <K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isUnchanged =
    user?.username === formData.username && user?.email === formData.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.username.trim() === "") {
      setError("Username cannot be empty");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Invalid email format");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: {
        success: boolean;
        data?: { username: string; email: string };
        message?: string;
        error?: string;
      } = await fetchApi("/api/protected/user", {
        method: "PUT",
        body: {
          username: formData.username.trim(),
          email: formData.email.trim(),
        },
      });

      if (!data.success) {
        setError(data.message || data.error || "Unable to update profile");
        return;
      }

      updateUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
      });
      notify(
        "Profile updated",
        "Your profile details have been saved.",
        "success",
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as { error?: string })?.error || "Unable to update profile";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your username and email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="settings-username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="settings-username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              aria-invalid={error !== ""}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="settings-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              aria-invalid={error !== ""}
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || isUnchanged}>
              {isSubmitting ? (
                <>
                  Saving...
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
