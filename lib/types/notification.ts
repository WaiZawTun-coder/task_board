type NotificationType = {
  notification_id?: number;
  id?: number | string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  is_read: boolean;
  created_at: string;
};

export default NotificationType;
