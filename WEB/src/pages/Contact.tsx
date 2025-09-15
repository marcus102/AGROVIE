import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";
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
      details: ["+226 74 18 97 63", "+226 60 08 97 04"],
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Mail,
      title: translations.contact.contactInfo.emailUs,
      details: ["support@agrovie.africa", "info@agrovie.africa"],
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: MapPin,
      title: translations.contact.contactInfo.visitUs,
      details: ["Ouagadougou, Burkina Faso"],
      gradient: "from-purple-500 to-purple-600",
    },
    {
      icon: Clock,
      title: translations.contact.contactInfo.businessHours,
      details: [
        `${translations.contact.contactInfo.monday} - ${translations.contact.contactInfo.friday}: 9AM - 6PM`,
        `${translations.contact.contactInfo.saturday}: 10AM - 4PM`,
        `${translations.contact.contactInfo.sunday}: ${translations.contact.contactInfo.closed}`,
      ],
      gradient: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 py-16 sm:py-24 lg:py-32 overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="absolute inset-0">
          <img
            src="https://raw.githubusercontent.com/marcus102/AGROVIE/refs/heads/main/assets/team/glenn-carstens-peters-piNf3C4TViA-unsplash.jpg"
            alt="Contact background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 sm:mb-8"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {translations.contact.tagline}
            </motion.div>

            <motion.h1
              variants={slideIn}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-6 sm:mb-8"
            >
              {translations.contact.title}
            </motion.h1>

            <motion.p
              variants={slideIn}
              className="text-lg sm:text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed px-4"
            >
              {translations.contact.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        <div className="py-12 sm:py-16 lg:py-24">
          {/* Contact Information Section */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="w-full max-w-7xl mx-auto"
          >
            {/* Section Header */}
            <div className="mb-8 sm:mb-12 text-center lg:text-left">
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-primary/10 text-primary text-base sm:text-lg font-bold mb-4">
                <Phone className="w-4 h-4 mr-2" />
                {translations.contact.contactInfo.title}
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-3xl mx-auto lg:mx-0">
                {translations.contact.contactInfo.description}
              </p>
            </div>

            {/* Contact Cards Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:p-8">
              {/* Mobile: Single Column, Tablet: 2 Columns, Desktop: 4 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-primary/20"
                    >
                      {/* Mobile Layout: Horizontal, Desktop Layout: Vertical */}
                      <div className="flex sm:block items-start space-x-4 sm:space-x-0">
                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-0 sm:mb-4`}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>

                        <div className="flex-1 sm:flex-none">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </h3>
                          <div className="space-y-1">
                            {item.details.map((detail, i) => (
                              <p key={i} className="text-gray-600 dark:text-gray-300 text-sm break-words">
                                {detail}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Additional Mobile Optimizations */}
            <div className="mt-8 sm:mt-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-2xl border border-primary/20"
              >
                <MessageSquare className="w-8 h-8 text-primary" />
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Quick Response Guarantee
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    We typically respond within 24 hours on business days
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Layout>
    </div>
  );
}