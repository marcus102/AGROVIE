import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../store/adminStore";
import { fadeIn } from "../utils/animations";
import { translations } from "../utils/translations";
import { motion } from "framer-motion";
import { Language, Translations } from "../types";

interface CtaSectionProps {
  language: Language;
  translations: Translations[Language];
}
export default function CtaSection({ translations }: CtaSectionProps) {
  const { user } = useAdminStore();
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-primary-DEFAULT rounded-3xl overflow-hidden shadow-xl"
    >
      <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl font-montserrat">
            <span className="block text-gray-600 dark:text-white mb-5">{translations.home.readyToGetStarted}</span>
            <span className="block text-primary-light">
              {translations.home.joinOurNetwork}
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">
            {translations.home.connect}
          </p>
        </div>
        <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            {user ? null : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-primary-DEFAULT bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {translations.home.login}
              </Link>
            )}
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-base font-medium rounded-full text-gray-700 dark:text-white bg-transparent hover:bg-white dark:hover:bg-gray-900 hover:text-primary-DEFAULT transition-colors duration-200"
            >
              {translations.home.contactUsButton}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
