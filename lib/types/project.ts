type ProjectType = {
  project_id: number;
  title: string;
  slug: string;
  description: string;
  status: "active" | "archived" | "completed";
  color_hex: string;
};

export type ProjectStats = {
  total: number;
  completed: number;
  on_going: number;
  pending: number;
  cancel: number;
  overdue: number;
};

export type ProjectDetail = ProjectType & { stats: ProjectStats };

export default ProjectType;
