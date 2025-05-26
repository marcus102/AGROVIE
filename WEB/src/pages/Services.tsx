import React from "react";
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
  Check,
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

export function Services({ translations }: ServiceProps) {
  const services = [
    {
      icon: Users,
      name: translations.services.service1.name,
      description: translations.services.service1.description,
      features: translations.services.service1.features,
    },
    {
      icon: Sprout,
      name: translations.services.service2.name,
      description: translations.services.service2.description,
      features: translations.services.service2.features,
    },
    {
      icon: Handshake,
      name: translations.services.service3.name,
      description: translations.services.service3.description,
      features: translations.services.service3.features,
    },
    {
      icon: ShieldCheck,
      name: translations.services.service4.name,
      description: translations.services.service4.description,
      features: translations.services.service4.features,
    },
    {
      icon: BarChart3,
      name: translations.services.service5.name,
      description: translations.services.service5.description,
      features: translations.services.service5.features,
    },
    {
      icon: TrendingUp,
      name: translations.services.service6.name,
      description: translations.services.service6.description,
      features: translations.services.service6.features,
    },
  ];

  const testimonials = [
    {
      quote:
        "AgroNetwork has transformed how we connect with agricultural experts. It's been invaluable for our farm's growth.",
      author: "Sarah Thompson",
      role: "Farm Owner",
      image:
        "https://images.pexels.com/photos/5717277/pexels-photo-5717277.jpeg",
    },
    {
      quote:
        "The platform's market insights have helped us make better decisions and improve our yield significantly.",
      author: "Michael Rodriguez",
      role: "Agricultural Consultant",
      image:
        "https://images.pexels.com/photos/8851637/pexels-photo-8851637.jpeg",
    },
    {
      quote:
        "Finding qualified agricultural technicians has never been easier. The verification system ensures quality partnerships.",
      author: "Emma Chen",
      role: "Agribusiness Manager",
      image:
        "https://images.pexels.com/photos/5717526/pexels-photo-5717526.jpeg",
    },
  ];

  return (
    <div className="bg-background-light dark:dark:bg-gray-900/80">
      {/* Hero Section */}
      <motion.div
        className="relative bg-primary-DEFAULT"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg"
            alt="Agricultural landscape"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black opacity-30" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} className="text-center">
            <motion.h1
              variants={slideIn}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl font-montserrat"
            >
              {translations.services.title}
            </motion.h1>
            <motion.p
              variants={slideIn}
              className="mt-6 text-xl text-gray-100 max-w-3xl mx-auto"
            >
              {translations.services.description}
            </motion.p>
            <motion.div
              variants={slideIn}
              className="mt-10 flex justify-center gap-x-6"
            >
              {/* <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-primary-DEFAULT bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {translations.services.getStarted}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link> */}
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-primary transition-colors duration-200"
              >
                {translations.services.contactSales}
              </Link>
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
          className="py-16"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-montserrat">
              {translations.services.solutionsForEveryNeed}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-200">
              {translations.services.solutionsForEveryNeedDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name}
                  variants={fadeIn}
                  whileHover={cardHover}
                  className="bg-white dark:dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
                >
                  <div className="flex justify-center">
                    <div className="bg-primary-light/10 p-4 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-gray-900 text-center">
                    {service.name}
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                    {service.description}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mr-3" />
                        <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
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
          className="py-16"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-montserrat">
              {translations.services.whatOurUsersSay}
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {translations.services.whatOurUsersSayDescription}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.author}
                variants={fadeIn}
                whileHover={cardHover}
                className="bg-white dark:dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-8">
                  <div className="relative">
                    <svg
                      className="absolute top-0 left-0 transform -translate-x-3 -translate-y-2 h-8 w-8 text-primary"
                      fill="currentColor"
                      viewBox="0 0 32 32"
                      aria-hidden="true"
                    >
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                    <p className="relative text-lg text-gray-600 dark:text-gray-400 italic">
                      {testimonial.quote}
                    </p>
                  </div>
                  <div className="mt-8 flex items-center">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src={testimonial.image}
                      alt={testimonial.author}
                    />
                    <div className="ml-4">
                      <div className="text-base font-medium text-gray-900 dark:text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-primary">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* CTA Section */}
        <CtaSection translations={translations} />
      </Layout>
    </div>
  );
}
