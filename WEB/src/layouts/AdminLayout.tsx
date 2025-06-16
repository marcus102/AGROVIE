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
  Sparkles,
  Settings,
  Link as LucideLink,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { useTheme } from "../contexts/ThemeContext";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Missions", href: "/admin/missions", icon: Target },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Blog", href: "/admin/blog", icon: PenTool },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Dynamic Pricing", href: "/admin/dynamic-pricing", icon: DollarSign },
  {name: "Links Management", href: "/admin/links", icon: LucideLink},
];

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
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="hidden md:flex md:w-72 md:flex-col"
      >
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-700">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-montserrat">
                  Admin
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Panel
                </span>
              </div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Controls Section */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              >
                <option value="en">🇺🇸 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary"
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 transition-transform duration-200 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-primary group-hover:scale-110"
                        }`}
                      />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 bg-white rounded-full"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Back to Site */}
          <div className="px-4 pb-6">
            <Link
              to="/"
              className="group flex items-center px-4 py-3 text-sm font-medium rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all duration-200"
            >
              <ArrowBigLeft className="mr-3 h-5 w-5 text-gray-400 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200" />
              Back to Site
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
