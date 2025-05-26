import React from "react";
import { Shield, Lock, Eye, UserCheck, Server, Bell } from "lucide-react";
import { Language, Translations } from "../types";

interface PrivacyPolicyProps {
  language: Language;
  translations: Translations[Language];
}

export function PrivacyPolicy({ translations }: PrivacyPolicyProps) {
  const sections = [
    {
      icon: Shield,
      title: `${translations.privacyPolicy.informationCollection}`,
      content: `${translations.privacyPolicy.informationCollectionContent}
        • ${translations.privacyPolicy.personalInformation}
        • ${translations.privacyPolicy.professionalInformation}
        • ${translations.privacyPolicy.accountCredentials}
        • ${translations.privacyPolicy.communicationPreferences}`,
    },
    {
      icon: Lock,
      title: `${translations.privacyPolicy.dataSecurity}`,
      content: `${translations.privacyPolicy.dataSecurityContent}`,
    },
    {
      icon: Eye,
      title: `${translations.privacyPolicy.informationUsage}`,
      content: `${translations.privacyPolicy.informationUsageContent}
        • ${translations.privacyPolicy.provideAndMaintainService}
        • ${translations.privacyPolicy.processTransaction}
        • ${translations.privacyPolicy.sendTechnicalNotice}
        • ${translations.privacyPolicy.communicateProduct}
        • ${translations.privacyPolicy.respondComment}`,
    },
    {
      icon: UserCheck,
      title: `${translations.privacyPolicy.userRights}`,
      content: `${translations.privacyPolicy.userRightsContent}
        • ${translations.privacyPolicy.accessYourInformation}
        • ${translations.privacyPolicy.correctYourInformation}
        • ${translations.privacyPolicy.deleteYourInformation}
        • ${translations.privacyPolicy.objectDataProcessing}
        • ${translations.privacyPolicy.requestDataPortability}`,
    },
    {
      icon: Server,
      title: `${translations.privacyPolicy.dataRetention}`,
      content: `${translations.privacyPolicy.dataRetentionContent}`,
    },
    {
      icon: Bell,
      title: `${translations.privacyPolicy.updatesToPolicy}`,
      content: `${translations.privacyPolicy.updatesToPolicyContent}`,
    },
  ];

  return (
    <div className="bg-background-light dark:bg-gray-900/80 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white font-montserrat mb-4">
            {translations.privacyPolicy.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {translations.privacyPolicy.lastUpdated} 10/10/2023
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {translations.privacyPolicy.description}
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
              {translations.privacyPolicy.contactInfo}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {translations.privacyPolicy.contactInfoContent}
            </p>
            <ul className="mt-4 text-gray-600 dark:text-gray-400">
              <li>{translations.privacyPolicy.email}</li>
              <li>{translations.privacyPolicy.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
