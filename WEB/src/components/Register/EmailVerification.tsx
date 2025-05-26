import React from 'react';
import { Mail } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
}

export function EmailVerification({ email }: EmailVerificationProps) {
  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Mail className="h-12 w-12 text-primary-DEFAULT" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Check your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification link to
        </p>
        <p className="mt-1 text-center text-lg font-medium text-gray-900">{email}</p>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-4">
                Click the link in the email to verify your account and continue with the registration process.
              </p>
              <p>
                If you don't see the email, check your spam folder. The link will expire in 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}