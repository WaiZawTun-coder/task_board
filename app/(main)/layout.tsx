import DashboardHeader from "@/components/dashboard/dashboard-header";
import Sidebar from "@/components/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
