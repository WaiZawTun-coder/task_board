import NotificationType from "@/lib/types/notification";

const NotificationCard = ({
  notification,
}: {
  notification: NotificationType;
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{notification.title}</h3>
        <span className="text-sm text-gray-500">{notification.created_at}</span>
      </div>
      <p className="text-gray-600">{notification.message}</p>
      {/* indicator for unread notifications */}
      {!notification.is_read && (
        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
      )}
    </div>
  );
};

export default NotificationCard;
