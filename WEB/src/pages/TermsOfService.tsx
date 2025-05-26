import React from "react";
import {
  FileText,
  Shield,
  Users,
  AlertTriangle,
  Scale,
  MessageSquare,
} from "lucide-react";
import { Language, Translations } from "../types";

interface TermsOfServiceProps {
  language: Language;
  translations: Translations[Language];
}

export function TermsOfService({ translations }: TermsOfServiceProps) {
  const sections = [
    {
      icon: FileText,
      title: `${translations.termsOfService.agreementToTerms}`,
      content: `${translations.termsOfService.agreementToTermsContent}`,
    },
    {
      icon: Shield,
      title: `${translations.termsOfService.accountSecurity}`,
      content: `${translations.termsOfService.accountSecurityContent}`,
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
    },
    {
      icon: AlertTriangle,
      title: `${translations.termsOfService.termination}`,
      content: `${translations.termsOfService.terminationContent}`,
    },
    {
      icon: Scale,
      title: `${translations.termsOfService.intellectualProperty}`,
      content: `${translations.termsOfService.intellectualPropertyContent}`,
    },
    {
      icon: MessageSquare,
      title: `${translations.termsOfService.communitcation}`,
      content: `${translations.termsOfService.communitcationContent}`,
    },
  ];

  return (
    <div className="bg-background-light dark:dark:bg-gray-900/80 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-montserrat mb-4">
            {translations.termsOfService.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {translations.termsOfService.lastUpdated} 10/10/2023
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {translations.termsOfService.description}
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-8 last:border-0"
                >
                  <div className="flex items-center mb-4">
                    <Icon className="h-6 w-6 text-primary mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {translations.termsOfService.contactInfo}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {translations.termsOfService.contactInfoContent}
            </p>
            <ul className="mt-4 text-gray-600 dark:text-gray-400">
              <li>{translations.termsOfService.email}</li>
              <li>{translations.termsOfService.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
