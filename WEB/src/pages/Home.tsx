import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Shield,
  Sprout,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Globe,
  Award,
} from "lucide-react";
import {
  fadeIn,
  staggerContainer,
  slideIn,
  cardHover,
} from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";
import { useAdminStore } from "../store/adminStore";
import CtaSection from "../components/CtaSection";
import { Billboard } from "../components/Billboard";

interface HomeProps {
  language: Language;
  translations: Translations[Language];
}

export function Home({ translations }: HomeProps) {
  const [showAppOverlay, setShowAppOverlay] = useState(false);

  const { links, fetchLinks } = useAdminStore();

  const features = [
    {
      icon: Users,
      title: translations.home.conectExperts,
      description: translations.home.conectExpertsDescription,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Target,
      title: translations.home.findOpportunities,
      description: translations.home.findOpportunitiesDescription,
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: translations.home.securePlatform,
      description: translations.home.securePlatformDescription,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const solutions = [
    {
      title: translations.home.forFarmers,
      description: translations.home.forFarmersDescription,
      image:
        "https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/offensive-agricole-burkina-faso-YT-1739963276.webp",
      benefits: translations.home.farmerBenefits,
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: translations.home.forTechnicians,
      description: translations.home.forTechniciansDescription,
      image:
        "https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/FieldActivity_01.jpg",
      benefits: translations.home.forTechniciansBenefits,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: translations.home.forEntrepreneurs,
      description: translations.home.forEntrepreneursDescription,
      image:
        "https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/agriculture_potirons_loumbi.jpg",
      benefits: translations.home.forEntrepreneursBenefits,
      gradient: "from-orange-500 to-red-600",
    },
  ];

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const playStoreLink =
    links.find((link) => link.category === "play-store")?.link || "";

  const appStoreLink =
    links.find((link) => link.category === "app-store")?.link || "";

  const apkLink =
    links.find((link) => link.category.trim() === "mobile-apk")?.link || "";

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* App Download Overlay */}
      {showAppOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors duration-200"
              onClick={() => setShowAppOverlay(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {translations.home.downloadAppTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {translations.home.downloadAppDescription}
              </p>
            </div>
            <div className="space-y-3">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={playStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
              >
                <span className="mr-3">📱</span>
                Google Play Store
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={appStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
              >
                <span className="mr-3">🍎</span>
                Apple App Store
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={apkLink}
                download
                className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg"
              >
                <span className="mr-3">📥</span>
                Direct Download (APK)
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Billboard />

      {/* Hero Section */}
      <motion.div
        className="relative overflow-hidden min-h-screen flex items-center"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background with Parallax Effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary-dark/80 to-green-900/90 z-10"></div>
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-full h-full object-cover"
            src="https://raw.githubusercontent.com/marcus102/AGRO/refs/heads/main/assets/team/Productions_agricoles_du_Burkina_Faso.webp"
            alt="Agricultural landscape"
          />
          {/* Animated Particles */}
          <div className="absolute inset-0 z-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, 20],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-30 max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            className="text-center lg:text-left lg:max-w-3xl"
          >
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <Star className="w-4 h-4 mr-2 text-yellow-400" />
              Trusted by Agricultural Professionals
            </motion.div>

            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat leading-tight"
            >
              <span className="block">
                {translations.home.title.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {translations.home.title.split(" ").slice(2).join(" ")}
              </span>
            </motion.h1>

            <motion.p
              variants={slideIn}
              className="mt-8 text-xl lg:text-2xl text-gray-100 max-w-3xl leading-relaxed"
            >
              {translations.home.subtitle}
            </motion.p>

            <motion.div
              variants={slideIn}
              className="mt-12 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
            >
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAppOverlay(true)}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-primary bg-white hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl"
              >
                <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                {translations.home.getStarted}
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-white border-2 border-white/30 hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  {translations.home.learnMore}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </motion.div>

      <Layout>
        {/* Features Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Why Choose Our Platform
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {translations.home.whyUs}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.home.whyUsDescription}
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={fadeIn}
                  whileHover={cardHover}
                  className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
                >
                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                  ></div>

                  <div className="relative z-10">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Solutions Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4 mr-2" />
              Tailored Solutions
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {translations.home.solutionsForEveryNeeds}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.home.solutionsForEveryNeedsDescription}
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={cardHover}
                className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
              >
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover"
                    src={solution.image}
                    alt={solution.title}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${solution.gradient} opacity-60`}
                  ></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {solution.title}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {solution.description}
                  </p>
                  <ul className="space-y-3">
                    {solution.benefits.map((benefit, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center text-gray-600 dark:text-gray-300"
                      >
                        <div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${solution.gradient} mr-3`}
                        ></div>
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <div className="py-24">
          <CtaSection translations={translations} />
        </div>
      </Layout>
    </div>
  );
}
