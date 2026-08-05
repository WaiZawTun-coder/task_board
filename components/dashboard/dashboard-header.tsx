"use client";

import { useTask } from "@/context/TaskContext";
import { Layout } from "lucide-react";
import NewTask from "../newTask";
import Search from "../search";
import { ThemeToggle } from "../themeToggler";
import NotificationHeader from "./notification-header";
import ProfileHeader from "./profile-header";
import { useParams } from "next/navigation";

const DashboardHeader = () => {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const isValidId = Number.isInteger(projectId) && projectId > 0;

  const { createTask } = useTask();

  // debounce the raw input before filtering projects / hitting the tasks API

  return (
    <header className="border-b md:z-50">
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 fixed top-0 w-full bg-background pl-10 md:pl-6">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
            TaskBoard
          </span>
        </div>
        <Search className="w-56 hidden sm:block" />

        <div className="ml-auto flex items-center gap-1 sm:gap-4">
          <ThemeToggle />

          <NewTask
            onCreate={createTask}
            selectedProject={isValidId ? projectId : undefined}
          />

          <NotificationHeader />
          <ProfileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
