"use client";

import AuthLoadingSkeleton from "@/components/dashboard/auth-loading-skeleton";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { TaskProvider } from "@/context/TaskContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = useAuth();

  if (!user) {
    return <AuthLoadingSkeleton />;
  }

  return (
    <ProjectProvider>
      <TaskProvider>
        <NotificationProvider>
          <div className="flex min-h-screen flex-col">
            <DashboardHeader />
            <div className="flex flex-1 min-h-0 mt-16">
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
