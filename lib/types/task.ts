type TaskType = {
  id: number;
  projectId?: number;
  title: string;
  description: string;
  status: "pending" | "on_going" | "cancel";
  priority: "low" | "medium" | "high";
  due: string;
};

export default TaskType;
