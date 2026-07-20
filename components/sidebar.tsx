import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  ChartColumn,
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 border-r bg-background">
      <nav aria-label="Main navigation" className="p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link
              href="/today"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <CalendarDays className="h-5 w-5" />
              <span>Today</span>
            </Link>
          </li>

          <li>
            <Link
              href="/calendar"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </Link>
          </li>

          <li>
            <Link
              href="/analytics"
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
            >
              <ChartColumn className="h-5 w-5" />
              <span>Analytics</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
