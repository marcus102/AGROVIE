import React from "react";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Language, Translations, PasswordRequirement } from "../types";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PasswordResetProps {
  language: Language;
  translations: Translations[Language];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const slideIn = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } },
};

export function PasswordReset({ language, translations }: PasswordResetProps) {
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  );

  const requirements: PasswordRequirement[] = [
    {
      id: "length",
      met: newPassword.length >= 8,
      labelEn: "At least 8 characters",
      labelFr: "Au moins 8 caractères",
    },
    {
      id: "uppercase",
      met: /[A-Z]/.test(newPassword),
      labelEn: "One uppercase letter",
      labelFr: "Une lettre majuscule",
    },
    {
      id: "number",
      met: /\d/.test(newPassword),
      labelEn: "One number",
      labelFr: "Un chiffre",
    },
    {
      id: "special",
      met: /[!@#$%^&*]/.test(newPassword),
      labelEn: "One special character",
      labelFr: "Un caractère spécial",
    },
    {
      id: "match",
      met: newPassword === confirmPassword && newPassword !== "",
      labelEn: "Passwords match",
      labelFr: "Les mots de passe correspondent",
    },
  ];

  const allRequirementsMet = requirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequirementsMet) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating password:", error.message);
      } else {
        console.error("Error updating password:", error);
      }
      setStatus("error");
    } finally {
      setIsLoading(false);
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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex justify-center"
        >
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent"></div>
          </div>
        </motion.div>

        <motion.h2
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mt-6 text-center text-4xl font-extrabold text-gray-900 dark:text-white font-montserrat"
        >
          {translations.resetPassword.title}
        </motion.h2>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={slideIn}
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Create a strong password to secure your account
        </motion.p>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-200/50 dark:border-gray-700/50">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.resetPassword.newPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-300"
                  placeholder="Enter your new password"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </motion.button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {translations.resetPassword.confirmPassword}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-gray-800 dark:text-white transition-all duration-300"
                  placeholder="Confirm your new password"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <Shield className="h-4 w-4 mr-2 text-primary" />
                {translations.resetPassword.requirements}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {requirements.map((requirement) => (
                  <motion.div
                    key={requirement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center text-sm transition-colors duration-200 ${
                      requirement.met
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div
                      className={`mr-2 p-1 rounded-full ${
                        requirement.met
                          ? "bg-green-100 dark:bg-green-900/30"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {requirement.met ? (
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    {language === "en"
                      ? requirement.labelEn
                      : requirement.labelFr}
                  </motion.div>
                ))}
              </div>
            </div>

            {status !== "idle" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border ${
                  status === "success"
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-center">
                  {status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      status === "success"
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {status === "success"
                      ? translations.resetPassword.success
                      : translations.resetPassword.error}
                  </span>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={!allRequirementsMet || isLoading}
              whileHover={{
                scale: allRequirementsMet && !isLoading ? 1.02 : 1,
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl transition-all duration-300 ${
                allRequirementsMet && !isLoading
                  ? "text-white bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl"
                  : "text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Updating Password...
                </div>
              ) : (
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  {translations.resetPassword.submit}
                </div>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
