import DashboardHeader from "@/components/dashboard/dashboard-header";
import Sidebar from "@/components/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <div className="min-h-full flex flex-col max-w-7xl mx-auto">{children}</div>
    <>
      <DashboardHeader />
      <div className="flex">
        <div className="max-w-2xs">
          <Sidebar />
        </div>
        <div className="mx-auto flex-2 max-w-7xl">{children}</div>
      </div>
    </>
  );
}
