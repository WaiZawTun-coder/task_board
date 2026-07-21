"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  ChartColumn,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  FolderKanban,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/UI/sheet";

type NavChild = {
  href: string;
  label: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: NavChild[];
};

type Project = {
  id: string;
  name: string;
  color: string; // used for the little dot next to the project name
};

// Wire `badge` up to real data (e.g. unread counts) and `children` to
// real sub-routes as your app grows.
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/today", label: "Today", icon: CalendarDays, badge: 3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  {
    href: "/analytics",
    label: "Analytics",
    icon: ChartColumn,
    children: [
      { href: "/analytics/overview", label: "Overview" },
      { href: "/analytics/reports", label: "Reports" },
    ],
  },
];

const COLLAPSE_STORAGE_KEY = "sidebar:collapsed";
const PROJECTS_EXPANDED_KEY = "sidebar:projects-expanded";

function isActivePath(pathname: string | null, href: string) {
  return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
}

function NavSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-5 w-5 shrink-0 animate-pulse rounded bg-muted" />
          {!collapsed && (
            <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          )}
        </li>
      ))}
    </ul>
  );
}

function ProjectsSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <ul className="space-y-2" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-lg px-3 py-1.5">
          <div className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-muted" />
          {!collapsed && (
            <div className="h-3.5 flex-1 animate-pulse rounded bg-muted" />
          )}
        </li>
      ))}
    </ul>
  );
}

function NavLinks({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Auto-expand a submenu if a child route is currently active.
  useEffect(() => {
    const activeParent = NAV_ITEMS.find((item) =>
      item.children?.some((child) => pathname === child.href),
    );
    const update = () => {
      if (activeParent) setExpanded(activeParent.href);
    };

    update();
  }, [pathname]);

  return (
    <ul className="space-y-1" data-slot="sidebar-nav">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item.href);
        const hasChildren = !!item.children?.length;
        const isExpanded = expanded === item.href;

        return (
          <li key={item.href}>
            <div className="flex items-center">
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge ? (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>

              {hasChildren && !collapsed && (
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) =>
                      prev === item.href ? null : item.href,
                    )
                  }
                  aria-expanded={isExpanded}
                  aria-label={`Toggle ${item.label} submenu`}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>
              )}
            </div>

            {hasChildren && !collapsed && isExpanded && (
              <ul className="mt-1 ml-8 space-y-1 border-l pl-3">
                {item.children!.map((child) => {
                  const childActive = pathname === child.href;
                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={childActive ? "page" : undefined}
                        className={cn(
                          "block rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          childActive
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function ProjectsSection({
  collapsed,
  projects,
  loading,
  onNavigate,
  onAddProject,
}: {
  collapsed: boolean;
  projects: Project[];
  loading: boolean;
  onNavigate?: () => void;
  onAddProject: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(PROJECTS_EXPANDED_KEY);
    const updateState = () => {
      if (stored === "false") setExpanded(false);
    };

    updateState();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROJECTS_EXPANDED_KEY, String(expanded));
  }, [expanded]);

  if (collapsed) {
    // Collapsed rail: just show icons/dots, no header row.
    return (
      <ul className="mt-4 space-y-1 border-t pt-4" aria-label="Projects">
        {loading ? (
          <ProjectsSkeleton collapsed />
        ) : (
          projects.map((project) => {
            const href = `/projects/${project.id}`;
            const active = isActivePath(pathname, href);
            return (
              <li key={project.id}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  title={project.name}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center rounded-lg px-0 py-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    active && "bg-muted",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                </Link>
              </li>
            );
          })
        )}
      </ul>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between px-3">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls="sidebar-projects-list"
          className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              !expanded && "-rotate-90",
            )}
          />
          Projects
        </button>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Add project"
          onClick={onAddProject}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {expanded && (
        <ul id="sidebar-projects-list" className="mt-1 space-y-0.5">
          {loading ? (
            <li className="px-3 py-1">
              <ProjectsSkeleton collapsed={false} />
            </li>
          ) : projects.length === 0 ? (
            <li className="px-3 py-1.5 text-sm text-muted-foreground">
              No projects yet
            </li>
          ) : (
            projects.map((project) => {
              const href = `/projects/${project.id}`;
              const active = isActivePath(pathname, href);
              return (
                <li key={project.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Restore collapsed preference (client-only to avoid hydration mismatch).
  useEffect(() => {
    const update = () => {
      const stored = window.localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
      setHydrated(true);
    };

    update();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
  }, [collapsed, hydrated]);

  // Simulated fetch — swap for a real permissions/nav-items request.
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  // Simulated fetch — swap for a real `/api/protected/project` call
  // scoped to the current user.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setProjects([
        { id: "website-redesign", name: "Website Redesign", color: "#3b82f6" },
        { id: "mobile-app", name: "Mobile App", color: "#a855f7" },
        { id: "q4-marketing", name: "Q4 Marketing", color: "#22c55e" },
      ]);
      setProjectsLoading(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, []);

  const handleAddProject = () => {
    // Replace with opening a "Create project" dialog / navigating to
    // a create-project route.
    console.log("Add project clicked");
  };

  const sidebarBody = (collapsed: boolean, onNavigate?: () => void) => (
    <>
      {loading ? (
        <NavSkeleton collapsed={collapsed} />
      ) : (
        <NavLinks collapsed={collapsed} onNavigate={onNavigate} />
      )}

      <ProjectsSection
        collapsed={collapsed}
        projects={projects}
        loading={projectsLoading}
        onNavigate={onNavigate}
        onAddProject={handleAddProject}
      />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        data-slot="sidebar"
        className={cn(
          "hidden shrink-0 border-r bg-background transition-[width] duration-200 md:flex md:flex-col",
          collapsed ? "md:w-17" : "md:w-64",
        )}
      >
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto p-4"
        >
          {sidebarBody(collapsed)}
        </nav>

        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="w-full justify-center"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" />
            ) : (
              <ChevronsLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="p-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b">
            <SheetTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Navigation
            </SheetTitle>
          </SheetHeader>
          <nav aria-label="Main navigation" className="p-4">
            {sidebarBody(false, () => setMobileOpen(false))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
