import React from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Language, Translations, PasswordRequirement } from '../types';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PasswordResetProps {
  language: Language;
  translations: Translations[Language];
}

export function PasswordReset({ language, translations }: PasswordResetProps) {
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const requirements: PasswordRequirement[] = [
    {
      id: 'length',
      met: newPassword.length >= 8,
      labelEn: 'At least 8 characters',
      labelFr: 'Au moins 8 caractères',
    },
    {
      id: 'uppercase',
      met: /[A-Z]/.test(newPassword),
      labelEn: 'One uppercase letter',
      labelFr: 'Une lettre majuscule',
    },
    {
      id: 'number',
      met: /\d/.test(newPassword),
      labelEn: 'One number',
      labelFr: 'Un chiffre',
    },
    {
      id: 'special',
      met: /[!@#$%^&*]/.test(newPassword),
      labelEn: 'One special character',
      labelFr: 'Un caractère spécial',
    },
    {
      id: 'match',
      met: newPassword === confirmPassword && newPassword !== '',
      labelEn: 'Passwords match',
      labelFr: 'Les mots de passe correspondent',
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

      setStatus('success');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating password:', error.message);
      } else {
        console.error('Error updating password:', error);
      }
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-DEFAULT flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
          {translations.resetPassword.title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background-paper py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-text-primary">
                {translations.resetPassword.newPassword}
              </label>
              <div className="mt-1 relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-text-secondary" />
                  ) : (
                    <Eye className="h-5 w-5 text-text-secondary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-text-primary">
                {translations.resetPassword.confirmPassword}
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-text-secondary focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-primary mb-2">
                {translations.resetPassword.requirements}
              </h3>
              <ul className="space-y-2">
                {requirements.map((requirement) => (
                  <li
                    key={requirement.id}
                    className={`flex items-center text-sm ${
                      requirement.met ? 'text-success-DEFAULT' : 'text-warning-DEFAULT'
                    }`}
                  >
                    {requirement.met ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    {language === 'en' ? requirement.labelEn : requirement.labelFr}
                  </li>
                ))}
              </ul>
            </div>

            {status !== 'idle' && (
              <div
                className={`p-4 rounded-md ${
                  status === 'success' ? 'bg-success-light text-success-DEFAULT' : 'bg-error-light text-error-DEFAULT'
                }`}
              >
                {status === 'success'
                  ? translations.resetPassword.success
                  : translations.resetPassword.error}
              </div>
            )}

            <button
              type="submit"
              disabled={!allRequirementsMet || isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-background-paper ${
                allRequirementsMet && !isLoading
                  ? 'bg-primary hover:bg-primary-hover'
                  : 'bg-text-secondary cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-background-paper"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                translations.resetPassword.submit
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}