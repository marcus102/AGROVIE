import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Language, Translations } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
// import { useAdminStore } from "../store/adminStore";

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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-6 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-10 h-10 rounded-lg bg-primary-DEFAULT flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary-light"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </motion.div>
              <span className="text-2xl font-montserrat font-bold text-primary dark:text-primary-light">
                Agro
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`relative text-base font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? "text-primary-DEFAULT dark:text-primary-light"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT dark:hover:text-primary-light"
                }`}
              >
                {item.name}
                {location.pathname === item.href && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary dark:bg-primary-light"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Language Dropdown */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-primary dark:hover:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-transparent dark:bg-gray-900"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>

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

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-primary dark:bg-primary-light flex items-center justify-center text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50"
                    >
                      {!hidden && <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        {user.email}
                      </Link>}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {translations.header.logout}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {!hidden && (
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark dark:bg-primary-light dark:hover:bg-primary-DEFAULT transition-colors duration-200"
                  >
                    {translations.header.register}
                  </Link>
                )}
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-primary-DEFAULT dark:border-primary-light text-sm font-medium rounded-lg text-primary-DEFAULT dark:text-primary-light hover:bg-primary-light hover:text-white dark:hover:bg-primary-light dark:hover:text-white transition-colors duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  {translations.header.login}
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary-DEFAULT dark:hover:text-primary-light transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-2 pb-3 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
                      location.pathname === item.href
                        ? "bg-primary-light/10 text-primary-DEFAULT dark:text-primary-light"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-DEFAULT dark:hover:text-primary-light"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Language Selector */}
                <div className="px-3 py-2">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:focus:ring-primary-light bg-transparent"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-5 w-5 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-5 w-5 mr-2" />
                      Dark Mode
                    </>
                  )}
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.profile}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      {translations.header.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-white bg-primary dark:bg-primary-light hover:bg-primary-dark dark:hover:bg-primary transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.register}
                    </Link>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-lg text-base font-medium text-primary-DEFAULT dark:text-primary-light hover:bg-primary-light hover:text-white dark:hover:bg-primary-DEFAULT transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {translations.header.login}
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
