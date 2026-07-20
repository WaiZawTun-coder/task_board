"use client";

import { LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../UI/avatar";
import { Button } from "../UI/button";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ProfileHeader = () => {
  const router = useRouter();

  const { logout } = useAuth();

  return (
    <Popover>
      <PopoverTrigger>
        {/* <Button variant="ghost" size="icon"> */}
        <Avatar>
          <AvatarImage src="/path/to/avatar.jpg" />
          <AvatarFallback>N</AvatarFallback>
        </Avatar>
        {/* </Button> */}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => router.push("/settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-600"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ProfileHeader;
