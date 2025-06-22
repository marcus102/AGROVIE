import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { useScrollToTop } from "./hooks/useScrollToTop";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Services } from "./pages/Services";
import { ServiceDetail } from "./pages/ServiceDetail";
import { Contact } from "./pages/Contact";
import { FAQ } from "./pages/FAQ";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { ProfilePage } from "./pages/Profile";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { PasswordReset } from "./components/PasswordReset";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminLogin } from "./components/AdminLogin";
import { RequireAuth } from "./components/RequireAuth";
import { Dashboard } from "./pages/admin/Dashboard";
import { UserManagement } from "./pages/admin/UserManagement";
import { MissionManagement } from "./pages/admin/MissionManagement";
import { DocumentManagement } from "./pages/admin/DocumentManagement";
import { BlogManagement } from "./pages/admin/BlogManagement";
import { PaymentManagement } from "./pages/admin/PaymentManagement";
import { NotificationManagement } from "./pages/admin/NotificationManagement";
import { DynamicPricing } from "./pages/admin/DynamicPricing";
import { LinksManagement } from "./pages/admin/LinksManagement";
import { translations } from "./constants";
import { Language } from "./types";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import { Outlet } from "react-router-dom";

// Component to handle scroll to top on route change
function ScrollToTopOnRouteChange() {
  useScrollToTop();
  return null;
}

function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage");
    return (savedLanguage as Language) || "fr";
  });

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <ScrollToTopOnRouteChange />
          <Routes>
            {/* Main App Routes with Header and Footer */}
            <Route
              element={
                <div className="min-h-screen flex flex-col font-open-sans bg-background-light">
                  <Header
                    language={language}
                    translations={translations[language]}
                    onLanguageChange={handleLanguageChange}
                  />
                  <main className="flex-grow">
                    <Outlet />
                  </main>
                  <Footer
                    language={language}
                    translations={translations[language]}
                  />
                  <ScrollToTop />
                </div>
              }
            >
              <Route
                path="/"
                element={
                  <Home
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/about"
                element={
                  <About
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/services"
                element={
                  <Services
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/services/:serviceId"
                element={
                  <ServiceDetail
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/contact"
                element={
                  <Contact
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/faq"
                element={
                  <FAQ
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/blog"
                element={
                  <Blog
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route
                path="/privacy-policy"
                element={
                  <PrivacyPolicy
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/terms-of-service"
                element={
                  <TermsOfService
                    language={language}
                    translations={translations[language]}
                  />
                }
              />

              <Route
                path="/login"
                element={
                  <Login
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <ForgotPassword
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PasswordReset
                    language={language}
                    translations={translations[language]}
                  />
                }
              />
            </Route>

            {/* Admin Routes (without Header and Footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="missions" element={<MissionManagement />} />
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="blog" element={<BlogManagement />} />
              <Route path="payments" element={<PaymentManagement />} />
              <Route
                path="notifications"
                element={<NotificationManagement />}
              />
              <Route path="dynamic-pricing" element={<DynamicPricing />} />
              <Route path="links" element={<LinksManagement />} />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
