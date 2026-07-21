type ProjectType = {
  project_id: number;
  title: string;
  slug: string;
  description: string;
  status: "active" | "archived" | "completed";
  colorHex: string;
};

export default ProjectType;
