import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, MessageCircle, Home } from 'lucide-react';

interface SubmissionConfirmationProps {
  referenceNumber: string;
}

export function SubmissionConfirmation({ referenceNumber }: SubmissionConfirmationProps) {
  return (
    <div className="min-h-screen bg-background-light flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Application Submitted
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your documents are under review
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mb-6">
              <p className="text-sm text-gray-600">Reference Number</p>
              <p className="mt-1 text-lg font-medium text-gray-900">{referenceNumber}</p>
            </div>

            <div className="flex items-center justify-center mb-6">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <p className="text-sm text-gray-600">
                Estimated completion time: <span className="font-medium">24 hours</span>
              </p>
            </div>

            <div className="space-y-4">
              <Link
                to="/track-application"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark"
              >
                <Clock className="h-4 w-4 mr-2" />
                Track Application Status
              </Link>

              <Link
                to="/contact"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Link>

              <Link
                to="/"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}