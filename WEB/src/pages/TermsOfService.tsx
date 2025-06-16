import React from "react";
import {
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  MessageSquare,
  CheckCircle,
  Clock,
  Mail,
  Phone,
} from "lucide-react";
import { Language, Translations } from "../types";
import { motion } from "framer-motion";

interface TermsOfServiceProps {
  language: Language;
  translations: Translations[Language];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function TermsOfService({ translations }: TermsOfServiceProps) {
  const sections = [
    {
      icon: FileText,
      title: `${translations.termsOfService.agreementToTerms}`,
      content: `${translations.termsOfService.agreementToTermsContent}`,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: `${translations.termsOfService.accountSecurity}`,
      content: `${translations.termsOfService.accountSecurityContent}`,
      color: "from-green-500 to-green-600",
    },
    {
      icon: Users,
      title: `${translations.termsOfService.userConduct}`,
      content: `${translations.termsOfService.userConductContent}
        • ${translations.termsOfService.userCondut1}
        • ${translations.termsOfService.userCondut2}
        • ${translations.termsOfService.userCondut3}
        • ${translations.termsOfService.userCondut4}
        • ${translations.termsOfService.userCondut5}`,
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: AlertTriangle,
      title: `${translations.termsOfService.termination}`,
      content: `${translations.termsOfService.terminationContent}`,
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Scale,
      title: `${translations.termsOfService.intellectualProperty}`,
      content: `${translations.termsOfService.intellectualPropertyContent}`,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: MessageSquare,
      title: `${translations.termsOfService.communitcation}`,
      content: `${translations.termsOfService.communitcationContent}`,
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 py-24 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-sm mb-8"
          >
            <Scale className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-extrabold text-white font-montserrat mb-6"
          >
            {translations.termsOfService.title}
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center space-x-4 text-gray-100"
          >
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span>
                {translations.termsOfService.lastUpdated}: January 10, 2025
              </span>
            </div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Effective Immediately</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Important Legal Information
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {translations.termsOfService.description}
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-start space-x-6">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {section.title}
                      </h3>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mt-16 bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-3xl p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {translations.termsOfService.contactInfo}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {translations.termsOfService.contactInfoContent}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-4">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {translations.termsOfService.email.replace("Email: ", "")}
                </p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl mr-4">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {translations.termsOfService.phone.replace("Phone: ", "")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
            <div className="flex items-start">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-4">
                <Scale className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Address
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {translations.termsOfService.address.replace("Address: ", "")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
