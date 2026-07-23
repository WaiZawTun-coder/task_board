"use client";

import DashboardHeader from "@/components/dashboard/dashboard-header";
import Sidebar from "@/components/sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authLoading, user } = useAuth();
  const router = useRouter();

  if (authLoading && !user) {
    return (
      <div className="mx-auto my-auto bg-red-500">
        Authentication Loading...
      </div>
    );
  }

  if (!authLoading && !user) {
    // router.push("login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="mx-auto flex-2 max-w-7xl overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
