type TaskType = {
  task_id: number;
  projectId?: number;
  title: string;
  description: string;
  status: "pending" | "on_going" | "cancel";
  priority: "low" | "medium" | "high";
  due: Date;
};

export default TaskType;
