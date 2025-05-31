import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  Target,
  FileText,
  PenTool,
  LayoutDashboard,
  DollarSign,
  LogOut,
  Bell,
  ArrowBigLeft,
  Sun,
  Moon,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { useTheme } from "../contexts/ThemeContext"; // <-- Add this import

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Missions", href: "/admin/missions", icon: Target },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Blog", href: "/admin/blog", icon: PenTool },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
];

// Accept language and onLanguageChange as props
export function AdminLayout({
  language,
  onLanguageChange,
}: {
  language: string;
  onLanguageChange: (lang: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminStore();
  const { theme, toggleTheme } = useTheme(); // <-- Use theme context

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen dark:dark:bg-gray-900/80">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col ">
        <div className="flex flex-col flex-grow pt-5 bg-white dark:dark:bg-gray-900/80 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4 ">
            <span className="text-xl font-bold text-primary">Admin Panel</span>
            <button
              onClick={handleLogout}
              className="p-2 text-primary hover:text-gray-500"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          {/* Theme & Language Controls */}
          <div className="flex items-center justify-between px-4 mt-4 gap-2">
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-transparent dark:bg-gray-900"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary-light text-white"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive
                          ? "text-white"
                          : "text-primary group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Link
            to="/"
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 hover:text-gray-900 mb-10"
          >
            <ArrowBigLeft className="mr-3 h-5 w-5 text-primary group-hover:text-primary" />
            Back to Site
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
