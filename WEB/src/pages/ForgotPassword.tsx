import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
import { Language, Translations } from "../types";
import { motion } from "framer-motion";

interface ForgotPasswordProps {
  language: Language;
  translations: Translations[Language];
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideIn = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
};

export function ForgotPassword({ translations }: ForgotPasswordProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // TODO: Implement actual password reset request logic
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error requesting password reset:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {isSubmitted ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-2xl">
                <CheckCircle className="h-10 w-10 text-white" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/20 to-transparent"></div>
              </div>
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white font-montserrat mb-4">
              {translations.forgotPassword.resetLinkTitle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {translations.forgotPassword.resetLinkSent}
            </p>
            <p className="text-xl font-semibold text-primary mb-6">
              {submittedEmail}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {translations.forgotPassword.checkEmail}
              </p>
            </div>
            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {translations.forgotPassword.backToHome}
                </Link>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSubmitted(false)}
                className="block w-full text-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300"
              >
                {translations.forgotPassword.requestAnotherLink}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex justify-center"
            >
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
              </div>
            </motion.div>

            <motion.h2
              initial="hidden"
              animate="visible"
              variants={slideIn}
              className="mt-6 text-center text-4xl font-extrabold text-gray-900 dark:text-white font-montserrat"
            >
              {translations.forgotPassword.title}
            </motion.h2>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={slideIn}
              className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
            >
              {translations.forgotPassword.description}
            </motion.p>
          </>
        )}
      </div>

      {!isSubmitted && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-200/50 dark:border-gray-700/50">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                >
                  {translations.forgotPassword.email}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("email")}
                    type="email"
                    className="appearance-none block w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-300"
                    placeholder={translations.forgotPassword.emailPlaceholder}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {translations.forgotPassword.sending}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    {translations.forgotPassword.sendResetLink}
                  </div>
                )}
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                    {translations.forgotPassword.or}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center">
                <motion.div whileHover={{ x: -5 }}>
                  <Link
                    to="/login"
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-300"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300" />
                    {translations.forgotPassword.backToLogin}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
