import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, MessageCircle, HelpCircle, Users, Zap, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";

interface FaqProps {
  language: Language;
  translations: Translations[Language];
}

export function FAQ({ translations }: FaqProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const categories = [
    { id: "all", name: translations.faq.tags[0], icon: HelpCircle },
    { id: "general", name: translations.faq.tags[1], icon: Star },
    { id: "farmers", name: translations.faq.tags[2], icon: Users },
    { id: "technicians", name: translations.faq.tags[3], icon: Zap },
    { id: "entrepreneurs", name: translations.faq.tags[4], icon: MessageCircle },
  ];

  const faqs = [
    {
      id: "1",
      category: "general",
      question: translations.faq.question1.question,
      answer: translations.faq.question1.answer,
    },
    {
      id: "2",
      category: "farmers",
      question: translations.faq.question2.question,
      answer: translations.faq.question2.answer,
    },
    {
      id: "3",
      category: "technicians",
      question: translations.faq.question3.question,
      answer: translations.faq.question3.answer,
    },
    {
      id: "4",
      category: "entrepreneurs",
      question: translations.faq.question4.question,
      answer: translations.faq.question4.answer,
    },
    {
      id: "5",
      category: "general",
      question: translations.faq.question5.question,
      answer: translations.faq.question5.answer,
    },
    {
      id: "6",
      category: "farmers",
      question: translations.faq.question6.question,
      answer: translations.faq.question6.answer,
    },
    {
      id: "7",
      category: "technicians",
      question: translations.faq.question7.question,
      answer: translations.faq.question7.answer,
    },
    {
      id: "8",
      category: "entrepreneurs",
      question: translations.faq.question8.question,
      answer: translations.faq.question8.answer,
    },
  ];

  const toggleQuestion = (id: string) => {
    setOpenQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      (activeCategory === "all" || faq.category === activeCategory) &&
      (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=1080&fit=crop"
            alt="FAQ Background"
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
              <HelpCircle className="w-4 h-4 mr-2" />
              Get Your Questions Answered
            </motion.div>
            
            <motion.h1
              variants={slideIn}
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-montserrat mb-8"
            >
              {translations.faq.title}
            </motion.h1>
            
            <motion.p
              variants={slideIn}
              className="text-xl lg:text-2xl text-gray-100 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              {translations.faq.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        {/* Search Bar */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-primary" />
              <input
                type="text"
                placeholder={translations.faq.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-900 dark:text-white transition-all duration-300 shadow-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="pb-12"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto pb-24"
        >
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
                className="mb-6"
              >
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <motion.button
                    onClick={() => toggleQuestion(faq.id)}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="w-full px-8 py-6 text-left flex justify-between items-center"
                  >
                    <span className="text-lg font-semibold text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{
                        rotate: openQuestions.includes(faq.id) ? 180 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-6 w-6 text-primary" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openQuestions.includes(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-6 pt-2 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                          <div className="w-12 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <motion.div 
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Questions Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {translations.faq.questionNotFound}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors duration-300"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}

        {/* Contact Support */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/5 to-primary-light/5 rounded-3xl p-12 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {translations.faq.stillHaveQuestions}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {translations.faq.cannotFind}
            </p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                {translations.faq.contactSupportButton}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </Layout>
    </div>
  );
}