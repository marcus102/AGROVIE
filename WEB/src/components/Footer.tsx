import React from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Language, Translations } from "../types";
import { motion } from "framer-motion";

interface FooterProps {
  language: Language;
  translations: Translations[Language];
}

export function Footer({ translations }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleDownloadApp = (platform: "android" | "ios") => {
    const url =
      platform === "android"
        ? "https://play.google.com/store/apps/details?id=com.agronetwork.app"
        : "https://apps.apple.com/app/agronetwork/id123456789";
    window.open(url, "_blank");
  };

  const footerSections = [
    {
      title: translations.footer.company,
      links: [
        { name: translations.header.about, href: "/about" },
        { name: translations.header.services, href: "/services" },
        { name: translations.header.blog, href: "/blog" },
        // { name: 'Careers', href: '/careers' },
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
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-4 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              {/* <div className="w-10 h-10 rounded-lg bg-primary-DEFAULT flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div> */}
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
              <span className="text-2xl font-montserrat font-bold text-primary dark:text-white">
                Agro
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 max-w-xs">
              {translations.footer.description}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="text-gray-400 hover:text-primary-DEFAULT transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="h-6 w-6 text-primary" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-3">
            <div className="md:grid md:grid-cols-3 md:gap-8">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {"links" in section
                      ? (section.links ?? []).map((link) => (
                          <Link
                            key={link.href}
                            to={link.href}
                            className="text-base text-gray-600 dark:text-gray-400 hover:text-primary-DEFAULT transition-colors duration-200 block"
                          >
                            {link.name}
                          </Link>
                        ))
                      : "items" in section &&
                        section.items.map((item, index) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={index}
                              className="flex items-center space-x-3 text-gray-600 dark:text-gray-400 hover:text-primary-DEFAULT transition-colors duration-200"
                            >
                              <Icon className="h-5 w-5 text-primary-DEFAULT" />
                              <span>{item.text}</span>
                            </div>
                          );
                        })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase flex items-center">
                <SmartphoneNfc className="h-5 w-5 mr-2 text-primary-DEFAULT" />
                {translations.footer.downloadApp}
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadApp("android")}
                  className="inline-flex items-center px-6 py-3 border-2 border-primary-DEFAULT rounded-xl text-sm font-medium text-primary-DEFAULT dark:text-white hover:bg-primary-DEFAULT hover:text-gray-500 transition-all duration-200"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {translations.footer.downloadAndroid}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadApp("ios")}
                  className="inline-flex items-center px-6 py-3 border-2 border-primary-DEFAULT rounded-xl text-sm font-medium text-primary-DEFAULT dark:text-white hover:bg-primary-DEFAULT hover:text-gray-500 transition-all duration-200"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {translations.footer.downloadIOS}
                </motion.button>
              </div>
            </div>
            <div className="flex items-center justify-start md:justify-end">
              <p className="text-base text-gray-500 dark:text-gray-400">
                &copy; {currentYear} Agro. {translations.footer.rights}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
