import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  Sprout,
  TrendingUp,
  ShieldCheck,
  Handshake,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  fadeIn,
  staggerContainer,
  slideIn,
  cardHover,
} from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";
import CtaSection from "../components/CtaSection";

interface ServiceProps {
  language: Language;
  translations: Translations[Language];
}

export function Services({ language, translations }: ServiceProps) {
  const services = [
    {
      id: "network-building",
      icon: Users,
      name: translations.services.service1.name,
      description: translations.services.service1.description,
      features: translations.services.service1.features,
      gradient: "from-blue-500 to-blue-600",
      image:
        "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&h=400&fit=crop",
    },
    {
      id: "knowledge-exchange",
      icon: Sprout,
      name: translations.services.service2.name,
      description: translations.services.service2.description,
      features: translations.services.service2.features,
      gradient: "from-green-500 to-green-600",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
    },
    {
      id: "partnership-facilitation",
      icon: Handshake,
      name: translations.services.service3.name,
      description: translations.services.service3.description,
      features: translations.services.service3.features,
      gradient: "from-purple-500 to-purple-600",
      image:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
    },
    {
      id: "verified-expertise",
      icon: ShieldCheck,
      name: translations.services.service4.name,
      description: translations.services.service4.description,
      features: translations.services.service4.features,
      gradient: "from-emerald-500 to-emerald-600",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
    },
    {
      id: "market-insights",
      icon: BarChart3,
      name: translations.services.service5.name,
      description: translations.services.service5.description,
      features: translations.services.service5.features,
      gradient: "from-orange-500 to-orange-600",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    },
    {
      id: "business-growth",
      icon: TrendingUp,
      name: translations.services.service6.name,
      description: translations.services.service6.description,
      features: translations.services.service6.features,
      gradient: "from-red-500 to-red-600",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    },
  ];

  // const testimonials = [
  //   {
  //     quote:
  //       "AgroNetwork has transformed how we connect with agricultural experts. It's been invaluable for our farm's growth.",
  //     author: "Sarah Thompson",
  //     role: "Farm Owner",
  //     image:
  //       "https://images.pexels.com/photos/5717277/pexels-photo-5717277.jpeg",
  //     rating: 5,
  //   },
  //   {
  //     quote:
  //       "The platform's market insights have helped us make better decisions and improve our yield significantly.",
  //     author: "Michael Rodriguez",
  //     role: "Agricultural Consultant",
  //     image:
  //       "https://images.pexels.com/photos/8851637/pexels-photo-8851637.jpeg",
  //     rating: 5,
  //   },
  //   {
  //     quote:
  //       "Finding qualified agricultural technicians has never been easier. The verification system ensures quality partnerships.",
  //     author: "Emma Chen",
  //     role: "Agribusiness Manager",
  //     image:
  //       "https://images.pexels.com/photos/5717526/pexels-photo-5717526.jpeg",
  //     rating: 5,
  //   },
  // ];

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.div
        className="relative bg-gradient-to-br from-primary via-primary-dark to-green-900 overflow-hidden"
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

        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=1080&fit=crop"
            alt="Agricultural landscape"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary-dark/80" />
        </div>

        <div className="relative max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.div
              variants={slideIn}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              <Zap className="w-4 h-4 mr-2" />
              {translations.services.agriculturalSolution}
            </motion.div>

            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              {translations.services.title}
            </motion.h1>

            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              {translations.services.description}
            </motion.p>

            <motion.div
              variants={slideIn}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white border-2 border-white/30 hover:border-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  {translations.services.contactSales}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        {/* Services Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-lg font-bold mb-6">
              <Sprout className="w-4 h-4 mr-2" />
              {translations.services.solutionsForEveryNeed}
            </div>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.services.solutionsForEveryNeedDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name + index}
                  variants={fadeIn}
                  whileHover={cardHover}
                  className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-60`}
                    ></div>
                    <div className="absolute top-4 left-4">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>

                    <ul className="space-y-3 mb-6">
                      {service.features.slice(0, 3).map((feature, i) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start"
                        >
                          <div
                            className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.gradient} mt-2 mr-3 flex-shrink-0`}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-300 text-sm">
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center justify-between"
                    >
                      <Link
                        to={`/services/${service.id}`}
                        className="inline-flex items-center text-primary font-semibold group"
                      >
                        {translations.services.learnMoreButton}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {service.features.length}{" "}
                        {translations.services.feature}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Testimonials Section */}
        {/* <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl"
        >
          <motion.div variants={fadeIn} className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Client Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-6">
              {translations.services.whatOurUsersSay}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {translations.services.whatOurUsersSayDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                variants={fadeIn}
                whileHover={cardHover}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-800 p-8"
              >
                <div className="relative mb-6">
                  <div className="text-6xl text-primary/20 font-serif absolute -top-2 -left-2">
                    "
                  </div>
                  <p className="relative text-gray-600 dark:text-gray-300 italic leading-relaxed text-lg">
                    {testimonial.quote}
                  </p>
                </div>

               
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <div className="flex items-center">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={testimonial.image}
                    alt={testimonial.author}
                  />
                  <div className="ml-4">
                    <div className="text-base font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-primary">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* CTA Section */}
        <div className="py-24">
          <CtaSection language={language} translations={translations} />
        </div>
      </Layout>
    </div>
  );
}
