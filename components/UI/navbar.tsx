"use client";

import { Layout } from "lucide-react";
import { ThemeToggle } from "../themeToggler";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const NavBar = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
            TaskBoard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
