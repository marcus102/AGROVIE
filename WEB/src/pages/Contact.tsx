import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock,MessageSquare } from "lucide-react";
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
      details: ["support@agronetwork.com", "info@agronetwork.com"],
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
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 py-32 overflow-hidden"
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
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop"
            alt="Contact background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {translations.contact.tagline}
            </motion.div>
            
            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              {translations.contact.title}
            </motion.h1>
            
            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto leading-relaxed"
            >
              {translations.contact.description}
            </motion.p>


          </motion.div>
        </div>
      </motion.div>

      <Layout>
        <div className="py-24">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Contact Information */}
            <motion.div 
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8 w-[1200px]"
            >
              <div className="mb-12">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-4">
                  <Phone className="w-4 h-4 mr-2" />
                 {translations.contact.contactInfo.title}
                </div>

                <p className="text-gray-600 dark:text-gray-300">
                  {translations.contact.contactInfo.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
                    >
                      <div className=" flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-300">
                            {item.title}
                          </h3>
                          <div className="space-y-1">
                            {item.details.map((detail, i) => (
                              <p key={i} className="text-gray-600 dark:text-gray-300 text-sm">
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
            </motion.div>
          </div>
        </div>
      </Layout>
    </div>
  );
}