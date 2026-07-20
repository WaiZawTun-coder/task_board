import { ThemeToggle } from "../themeToggler";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import NotificationHeader from "./notification-header";
import ProfileHeader from "./profile-header";

const DashboardHeader = () => {
  return (
    <header className="bg-amber-600">
      <div className="flex h-16 items-center px-6">
        <Input placeholder="Search tasks..." className="max-w-sm px-4 py-2" />

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <Button size="lg">New Task</Button>

          {/* <Bell className="cursor-pointer" /> */}
          <NotificationHeader />

          <ProfileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
