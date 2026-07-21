"use client";

import { useTask } from "@/context/TaskContext";
import NewTask from "../newTask";
import { ThemeToggle } from "../themeToggler";
import { Input } from "../UI/input";
import NotificationHeader from "./notification-header";
import ProfileHeader from "./profile-header";

const DashboardHeader = () => {
  const { createTask } = useTask();

  return (
    <header className="border-b">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        {/* Search: hidden on mobile, visible from sm up */}
        <Input
          placeholder="Search tasks..."
          className="hidden max-w-sm px-4 py-2 sm:block"
        />

        <div className="ml-auto flex items-center gap-1 sm:gap-4">
          <ThemeToggle />

          <NewTask onCreate={createTask} />

          <NotificationHeader />
          <ProfileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
