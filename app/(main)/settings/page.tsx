"use client";

import { Settings as SettingsIcon } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { AppearanceSettings } from "@/components/settings/appearance-settings";
import { DangerZone } from "@/components/settings/danger-zone";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";

export default function SettingsPage() {
  return (
    <div className="min-w-full space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <SettingsIcon className="h-6 w-6" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, appearance, and security preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4">
          <ProfileSettingsForm />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 pt-4">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="security" className="space-y-6 pt-4">
          <PasswordSettingsForm />
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
