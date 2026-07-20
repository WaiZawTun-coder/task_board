type NotificationType = {
  id?: number;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  is_read: boolean;
  created_at: string;
};

export default NotificationType;
