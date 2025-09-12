import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Sun, Moon, ChevronDown, LogOut, Tractor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Language, Translations } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { ScrollToTopLink } from "./ScrollToTopLink";

interface HeaderProps {
  language: Language;
  translations: Translations[Language];
  onLanguageChange: (lang: Language) => void;
}

export function Header({
  language,
  translations,
  onLanguageChange,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, user, isAdmin, checkIsAdminStatus } =
    useAuth();

  const navigation = [
    { name: translations.header.about, href: "/about" },
    { name: translations.header.services, href: "/services" },
    { name: translations.header.contact, href: "/contact" },
    { name: translations.header.faq, href: "/faq" },
    { name: translations.header.blog, href: "/blog" },
  ];

  useEffect(() => {
    checkIsAdminStatus(user);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    const lang = newLanguage as Language;
    localStorage.setItem("preferredLanguage", lang);
    onLanguageChange(lang);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl border-b border-primary/10"
        : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          <div className="flex items-center">
            <ScrollToTopLink to="/" className="flex items-center space-x-3 group">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
              >
                <Tractor className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent font-montserrat">
                  Agrovie
                </span>
                {/* <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Network
                </span> */}
              </div>
            </ScrollToTopLink>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <ScrollToTopLink
                key={item.href}
                to={item.href}
                className={`relative text-base font-medium transition-all duration-300 group ${location.pathname === item.href
                  ? "text-primary dark:text-primary-light"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light"
                  }`}
              >
                <span className="relative z-10">{item.name}</span>
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="absolute inset-0 rounded-lg bg-primary/5 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </ScrollToTopLink>
            ))}

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />

            {/* Enhanced Language Dropdown */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="appearance-none bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 cursor-pointer"
              >
                <option value="en">🇺🇸 EN</option>
                <option value="fr">🇫🇷 FR</option>
              </select>
            </div>

            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-primary/10 hover:to-primary-light/10 transition-all duration-300 shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>

            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary-light/10 hover:from-primary/20 hover:to-primary-light/20 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg">
                    <User className="h-5 w-5" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </motion.button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user?.email}
                        </p>
                      </div>

                      <ScrollToTopLink
                        to={`/profile/${user?.id}`}
                        className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        {translations.header.profile}
                      </ScrollToTopLink>

                      {isAdmin && (
                        <ScrollToTopLink
                          to="/admin"
                          className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </ScrollToTopLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center transition-colors duration-200"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        {translations.header.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {!hidden && (
                  <ScrollToTopLink
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {translations.header.register}
                  </ScrollToTopLink>
                )}
                <ScrollToTopLink
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border-2 border-primary text-sm font-medium rounded-xl text-primary hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <User className="h-4 w-4 mr-2" />
                  {translations.header.login}
                </ScrollToTopLink>
              </div>
            )}
          </div>

          <div className="lg:hidden">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/10 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-2 shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <ScrollToTopLink
                    key={item.href}
                    to={item.href}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${location.pathname === item.href
                      ? "bg-gradient-to-r from-primary/20 to-primary-light/20 text-primary"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </ScrollToTopLink>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between px-4 py-2">
                    <select
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="fr">🇫🇷 Français</option>
                    </select>
                    <button
                      onClick={toggleTheme}
                      className="ml-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Moon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {isAuthenticated ? (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <ScrollToTopLink
                      to={`/profile/${user?.id}`}
                      className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.profile}
                    </ScrollToTopLink>
                    {isAdmin && (
                      <ScrollToTopLink
                        to="/admin"
                        className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Dashboard
                      </ScrollToTopLink>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {translations.header.logout}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                    <ScrollToTopLink
                      to="/register"
                      className="block px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-primary to-primary-dark text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.register}
                    </ScrollToTopLink>
                    <ScrollToTopLink
                      to="/login"
                      className="block px-4 py-3 rounded-xl text-base font-medium text-primary border-2 border-primary text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.login}
                    </ScrollToTopLink>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}