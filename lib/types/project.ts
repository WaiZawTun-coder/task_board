type ProjectType = {
  project_id: number;
  title: string;
  slug: string;
  description: string;
  status: "active" | "archived" | "completed";
  color_hex: string;
};

export default ProjectType;
