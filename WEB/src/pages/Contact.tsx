import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";

interface ContactProps {
  language: Language;
  translations: Translations[Language];
}

export function Contact({ translations }: ContactProps) {
  const contactInfo = [
    {
      icon: Phone,
      title: translations.contact.contactInfo.callUs,
      details: ["+226-------------", "+226-------------"],
    },
    {
      icon: Mail,
      title: translations.contact.contactInfo.emailUs,
      details: ["support@agronetwork.com", "info@agronetwork.com"],
    },
    {
      icon: Clock,
      title: translations.contact.contactInfo.businessHours,
      details: [
        `${translations.contact.contactInfo.monday} - ${translations.contact.contactInfo.friday}: 9AM - 6PM`,
        `${translations.contact.contactInfo.saturday}: 10AM - 4PM`,
        `${translations.contact.contactInfo.sunday}: ${translations.contact.contactInfo.closed}`,
      ],
    },
  ];

  return (
    <div className="bg-background-light dark:dark:bg-gray-900/80 min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="relative bg-primary-DEFAULT py-24"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Contact background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.h1
              variants={slideIn}
              className="text-4xl font-bold text-white font-montserrat mb-4"
            >
              {translations.contact.title}
            </motion.h1>
            <motion.p
              variants={slideIn}
              className="text-lg text-gray-100 max-w-2xl mx-auto"
            >
              {translations.contact.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        <div className=" gap-8 align-items-center w-full ">
          {/* Contact Information */}

          <motion.div variants={fadeIn} className="lg:col-span-1 ">
            <div className="bg-white dark:dark:bg-gray-900 rounded-2xl shadow-lg p-8 space-y-8">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white border-b-2 border-primary-light pb-2 mb-10">
                {translations.contact.contactInfo.title}
              </h3>
              <div className="flex gap-10 flex-wrap ">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start space-x-4"
                    >
                      <div className="bg-primary-light/10 p-3 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                        <div className="mt-2 text-gray-600 dark:text-gray-400">
                          {item.details.map((detail, index) => (
                            <p key={index}>{detail}</p>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </div>
  );
}
