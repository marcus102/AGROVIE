import React, { useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Download,
  SmartphoneNfc,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { Language, Translations } from "../types";
import { motion } from "framer-motion";
import { ScrollToTopLink } from "./ScrollToTopLink";
import { useAdminStore } from "../store/adminStore";

interface FooterProps {
  language: Language;
  translations: Translations[Language];
}

export function Footer({ translations }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { fetchLinks, links } = useAdminStore();

  const handleDownloadApp = (platform: "android" | "ios") => {
    const url = platform === "android" ? playStoreLink : appStoreLink;
    window.open(url, "_blank");
  };

  const footerSections = [
    {
      title: translations.footer.company,
      links: [
        { name: translations.header.about, href: "/about" },
        { name: translations.header.services, href: "/services" },
        { name: translations.header.blog, href: "/blog" },
      ],
    },
    {
      title: translations.footer.support,
      links: [
        { name: translations.header.contact, href: "/contact" },
        { name: translations.header.faq, href: "/faq" },
        { name: translations.footer.privacy, href: "/privacy-policy" },
        { name: translations.footer.terms, href: "/terms-of-service" },
      ],
    },
    {
      title: translations.footer.contact,
      items: [
        { icon: Mail, text: "contact@agronetwork.com" },
        { icon: Phone, text: "+226----------" },
        { icon: MapPin, text: "Ouagadougou, Burkina Faso" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: Facebook,
      href: "#",
      label: "Facebook",
      color: "hover:text-blue-500",
    },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-sky-500" },
    {
      icon: Instagram,
      href: "#",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
  ];

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const playStoreLink =
    links.find((link) => link.category === "play-store")?.link || "";

  const appStoreLink =
    links.find((link) => link.category === "app-store")?.link || "";

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          {/* Brand Section */}
          <div className="space-y-8 xl:col-span-1">
            <ScrollToTopLink
              to="/"
              className="flex items-center space-x-3 group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-light to-white bg-clip-text text-transparent font-montserrat">
                  Agro
                </span>
                <span className="text-sm text-gray-400 font-medium">
                  Network
                </span>
              </div>
            </ScrollToTopLink>

            <p className="text-gray-300 max-w-xs leading-relaxed">
              {translations.footer.description}
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className={`p-3 rounded-xl bg-white/5 text-gray-400 ${social.color} transition-all duration-300 hover:bg-white/10 hover:scale-110`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Sections */}
          <div className="mt-12 grid grid-cols-1 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {footerSections.map((section) => (
                <div key={section.title} className="mb-8 md:mb-0">
                  <h3 className="text-lg font-semibold text-white tracking-wider uppercase mb-6 relative">
                    {section.title}
                    <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-primary to-primary-light"></div>
                  </h3>
                  <div className="space-y-4">
                    {"links" in section
                      ? (section.links ?? []).map((link) => (
                          <ScrollToTopLink
                            key={link.href}
                            to={link.href}
                            className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                          >
                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                              {link.name}
                            </span>
                            <ArrowUpRight className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                          </ScrollToTopLink>
                        ))
                      : "items" in section &&
                        section.items.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3 text-gray-300 group"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="group-hover:text-white transition-colors duration-300">
                                {item.text}
                              </span>
                            </div>
                          );
                        })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
                  <SmartphoneNfc className="h-6 w-6" />
                </div>
                {translations.footer.downloadApp}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadApp("android")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5 mr-3" />
                  {translations.footer.downloadAndroid}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadApp("ios")}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5 mr-3" />
                  {translations.footer.downloadIOS}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center text-gray-400">
              <span>
                &copy; {currentYear} Agro Network. {translations.footer.rights}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <ScrollToTopLink
                to="/privacy-policy"
                className="hover:text-white transition-colors duration-300"
              >
                Privacy
              </ScrollToTopLink>
              <ScrollToTopLink
                to="/terms-of-service"
                className="hover:text-white transition-colors duration-300"
              >
                Terms
              </ScrollToTopLink>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
