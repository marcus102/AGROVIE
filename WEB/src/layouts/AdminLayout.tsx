import React, { useState } from "react";
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
  Tractor,
  Link as LucideLink,
  Menu,
  X,
} from "lucide-react";
import { useAdminStore } from "../store/adminStore";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Missions", href: "/admin/missions", icon: Target },
  { name: "Documents", href: "/admin/documents", icon: FileText },
  { name: "Blog", href: "/admin/blog", icon: PenTool },
  { name: "Payments", href: "/admin/payments", icon: DollarSign },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Dynamic Pricing", href: "/admin/dynamic-pricing", icon: DollarSign },
  { name: "Links Management", href: "/admin/links", icon: LucideLink },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          {/* Mobile Menu - Full width for better accessibility */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-full bg-white dark:bg-gray-900 shadow-xl md:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full max-w-sm mx-auto">
              {/* Mobile Header - Larger touch targets */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                <Link
                  to="/admin"
                  className="flex items-center space-x-3 group touch-manipulation"
                  onClick={closeMobileMenu}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
                  >
                    <Tractor className="w-6 h-6 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-montserrat">
                      Admin
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Panel
                    </span>
                  </div>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeMobileMenu}
                  className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 touch-manipulation min-w-12 min-h-12 flex items-center justify-center"
                >
                  <X className="h-7 w-7" />
                </motion.button>
              </div>

              {/* Mobile Controls - Larger inputs */}
              <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => onLanguageChange(e.target.value)}
                      className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-base text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 touch-manipulation"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="fr">🇫🇷 Français</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-gray-600 dark:text-gray-400">
                      Dark Mode
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleTheme}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 touch-manipulation min-w-14 min-h-14 flex items-center justify-center"
                      aria-label="Toggle theme"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-6 w-6 text-yellow-500" />
                      ) : (
                        <Moon className="h-6 w-6 text-gray-600" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Links - Optimized for touch */}
              <div className="flex-1 px-4 py-6">
                <nav className="space-y-3">
                  {navigation.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                      <motion.div
                        key={`${item.name}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          onClick={closeMobileMenu}
                          className={`group flex items-center px-6 py-5 text-lg font-medium rounded-2xl transition-all duration-200 touch-manipulation min-h-16 ${
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg transform scale-[1.02]"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary active:bg-gray-100 dark:active:bg-gray-700"
                          }`}
                        >
                          <Icon
                            className={`mr-5 h-7 w-7 transition-transform duration-200 ${
                              isActive
                                ? "text-white"
                                : "text-gray-400 group-hover:text-primary group-hover:scale-110"
                            }`}
                          />
                          <span className="flex-1">{item.name}</span>
                          {isActive && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="w-3 h-3 bg-white rounded-full shadow-sm"
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

              {/* Mobile Footer Actions - Larger touch targets */}
              <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className="group flex items-center px-6 py-5 text-lg font-medium rounded-2xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all duration-200 touch-manipulation min-h-16"
                >
                  <ArrowBigLeft className="mr-5 h-7 w-7 text-gray-400 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200" />
                  Back to Site
                </Link>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center px-6 py-5 text-lg font-medium rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 touch-manipulation min-h-16"
                >
                  <LogOut className="mr-5 h-7 w-7" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Desktop Sidebar Component (unchanged for desktop)
  const DesktopSidebar = () => (
    <div
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
              <Tractor className="w-5 h-5 text-white" />
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
                <div
                  key={`${item.name}-${index}`}
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
                </div>
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
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile Header - Larger touch targets */}
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200 touch-manipulation min-w-12 min-h-12 flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7" />
            </motion.button>

            <Link to="/admin" className="flex items-center space-x-2 touch-manipulation">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
              >
                <Tractor className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-montserrat">
                Admin
              </span>
            </Link>

            <div className="w-12" /> {/* Spacer for centering */}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}