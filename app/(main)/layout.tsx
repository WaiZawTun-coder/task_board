"use client";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";
import { useRouter } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authLoading, user } = useAuth();

  if (authLoading && !user) {
    return (
      <div className="mx-auto my-auto bg-red-500">
        Authentication Loading...
      </div>
    );
  }

  return (
    <ProjectProvider>
      <TaskProvider>
        <NotificationProvider>
          <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="flex flex-1 min-h-0">
              <Sidebar />
              <div className="mx-auto flex-2 max-w-7xl overflow-y-auto">
                {children}
              </div>
            </div>
          </div>
        </NotificationProvider>
      </TaskProvider>
    </ProjectProvider>
  );
}
