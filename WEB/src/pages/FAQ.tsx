import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { fadeIn, staggerContainer, slideIn } from "../utils/animations";
import { Layout } from "../components/Layout";
import { Language, Translations } from "../types";

interface FaqProps {
  language: Language;
  translations: Translations[Language];
}

export function FAQ({translations }: FaqProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const categories = [
    { id: "all", name: translations.faq.tags[0] },
    { id: "general", name: translations.faq.tags[1] },
    { id: "farmers", name: translations.faq.tags[2] },
    { id: "technicians", name: translations.faq.tags[3] },
    { id: "entrepreneurs", name: translations.faq.tags[4] },
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
    <div className="bg-background-light dark:dark:bg-gray-900/80 min-h-screen">
      {/* Hero Section */}
      <motion.div
        className="relative bg-primary-DEFAULT py-16"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/21393/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="FAQ Background"
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
              {translations.faq.title}
            </motion.h1>
            <motion.p
              variants={slideIn}
              className="text-lg text-gray-100 max-w-2xl mx-auto"
            >
              {translations.faq.description}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>

      <Layout>
        {/* Search Bar */}
        <motion.div variants={fadeIn} className="max-w-2xl mx-auto mb-8">
          <div className="relative ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
            <input
              type="text"
              placeholder={translations.faq.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          variants={fadeIn}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                activeCategory === category.id
                  ? "bg-primary text-white shadow-lg dark:bg-primary-dark"
                  : "bg-white text-gray-600 dark:text-gray-200 hover:bg-gray-50 shadow dark:bg-gray-900"
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={staggerContainer}
          className="max-w-3xl mx-auto space-y-4"
        >
          <AnimatePresence>
            {filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                layout
                className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden transform transition-all duration-200 hover:shadow-md"
              >
                <button
                  onClick={() => toggleQuestion(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{
                      rotate: openQuestions.includes(faq.id) ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openQuestions.includes(faq.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 py-4 bg-gray-50 dark:bg-gray-900"
                    >
                      <p className="text-gray-600 dark:text-gray-200">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* No Results */}
        {filteredFaqs.length === 0 && (
          <motion.div variants={fadeIn} className="text-center mt-12 ">
            <p className="text-gray-600 dark:text-gray-200">
              {translations.faq.questionNotFound}
            </p>
          </motion.div>
        )}

        {/* Contact Support */}
        <motion.div
          variants={fadeIn}
          className="text-center mt-16 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8"
        >
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {translations.faq.stillHaveQuestions}
          </h2>
          <p className="text-gray-600 dark:text-gray-200 mb-6">
            {translations.faq.cannotFind}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-3 border border text-base text-gray-900 dark:text-white font-medium rounded-full bg-primary hover:bg-primary-dark transition-colors duration-200"
          >
            {translations.faq.contactSupportButton}
          </Link>
        </motion.div>
      </Layout>
    </div>
  );
}
