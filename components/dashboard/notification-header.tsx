"use client";

import { useNotification } from "@/context/NotificationContext";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../UI/button";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
import NotificationCard from "../notification/notification-card";

const NotificationHeader = () => {
  const { notifications, loadNotifications } = useNotification();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <Popover>
      <PopoverTrigger>
        {/* <Button variant="ghost" size="icon"> */}
        <Bell className="cursor-pointer" />
        {/* </Button> */}
      </PopoverTrigger>
      <PopoverContent className="w-sm p-2">
        <div className="space-x-0 space-y-2">
          <p className="text-sm text-gray-500">Notifications</p>
          <div className="flex flex-col gap-2">
            {notifications.length === 0 && (
              <p className="text-sm text-gray-500">No notifications</p>
            )}
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationHeader;
