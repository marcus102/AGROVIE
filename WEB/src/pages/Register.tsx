import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "../components/Register/RegisterForm";
import { EmailVerification } from "../components/Register/EmailVerification";
import { DocumentUpload } from "../components/Register/DocumentUpload";
import { SubmissionConfirmation } from "../components/Register/SubmissionConfirmation";
import {
  useAdminStore,
  Role,
  UserSuperRole,
  AccountStatus,
  UserNationality,
  VerificationStatus,
  DocStatus,
} from "../store/adminStore";
import { IdType, LegalDocType } from "../store/adminStore";
import { createClient } from "@supabase/supabase-js";
import { Language, Translations } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RegisterProps {
  language: Language;
  translations: Translations[Language];
}

interface Document {
  id: string;
  type: string;
  documentType: IdType | LegalDocType;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress?: number;
}

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

type Steps = 1 | 2 | 3 | 4;

export function Register({ translations }: RegisterProps) {
  const navigate = useNavigate();
  const { createUser, resendVerificationCode, verifyOtp, user } =
    useAdminStore();
  const [step, setStep] = useState<Steps>(1);
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [referenceNumber] = useState(
    () =>
      "REF" +
      Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).substr(2, 5).toUpperCase()
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleRegistrationSubmit = async (data: RegistrationData) => {
    try {
      setError(null);
      setRegistrationData(data);

      // Create user in Supabase with complete profile data
      const createUder = await createUser(data.email, data.password, {
        role: data.role as Role,
        super_role: "user" as UserSuperRole,
        full_name: data.fullName,
        phone: data.phone,
        nationality: "national" as UserNationality,
        specialization: [],
        availability_status: ["available"],
        verification_status: "not_verified" as VerificationStatus,
        docs_status: "pending" as DocStatus,
        profile_picture: "",
        actual_location: "",
        availability_locations: [],
        portfolio: [],
        bio: "",
        certifications: [],
        skills: [],
        work_experience: [],
        education: [],
        languages: [],
        status: "active",
        active: true,
        account_status: "healthy" as AccountStatus,
        account_verified: false,
        metadata: JSON.parse("{}"),
      });

      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleResendVerification = async () => {
    if (!user || !registrationData) return;

    try {
      setError(null);
      await resendVerificationCode(
        user.id,
        registrationData.email,
        registrationData.fullName
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to resend verification code"
      );
    }
  };

  const handleVerificationComplete = async (code: string) => {
    try {
      setError(null);
      await verifyOtp(code);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const handleDocumentAdd = async (document: Document) => {
    try {
      setIsUploading(true);
      setError(null);

      // Update local state first
      setDocuments((prev) => [
        ...prev.filter((d) => d.id !== document.id),
        document,
      ]);

      if (document.status === "completed") {
        // Get the currently authenticated user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("No authenticated user found");

        // Upload the file to Supabase Storage
        const fileExt = document.file.name.split(".").pop();
        const filePath = `${user.id}/${document.type}/${document.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, document.file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("documents").getPublicUrl(filePath);

        // Create document record in the database
        const { error: dbError } = await supabase
          .from("user_documents")
          .insert({
            user_id: user.id,
            identification_type:
              document.type === "identity" ? document.documentType : null,
            id_file_path: document.type === "identity" ? publicUrl : null,
            legal_document_type:
              document.type === "legal" ? document.documentType : null,
            legal_file_path: document.type === "legal" ? publicUrl : null,
            status: "pending",
          });

        if (dbError) throw dbError;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload document"
      );

      // Update document status to error
      setDocuments((prev) =>
        prev.map((d) => (d.id === document.id ? { ...d, status: "error" } : d))
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentRemove = async (id: string) => {
    try {
      setError(null);
      const document = documents.find((d) => d.id === id);
      if (!document) return;

      // Remove from local state first
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));

      // Get the currently authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      // Delete from Supabase Storage if uploaded
      if (document.status === "completed") {
        const fileExt = document.file.name.split(".").pop();
        const filePath = `${user.id}/${document.type}/${document.id}.${fileExt}`;

        const { error: deleteError } = await supabase.storage
          .from("documents")
          .remove([filePath]);

        if (deleteError) throw deleteError;

        // Delete document record from database
        const { error: dbError } = await supabase
          .from("user_documents")
          .delete()
          .match({
            user_id: user.id,
            [document.type === "identity" ? "id_file_path" : "legal_file_path"]:
              filePath,
          });

        if (dbError) throw dbError;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove document"
      );
    }
  };

  const handleDocumentsComplete = async () => {
    try {
      setError(null);

      // Get the currently authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      // Update user profile status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ docs_status: "pending" })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setStep(4);
      console.log("Documents submitted", step);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete document submission"
      );
    }
  };

  return (
    <div className="relative min-h-screen bg-background-light dark:bg-gray-900/80">
      {/* Progress Steps */}
      <div className="absolute top-0 left-0 right-0 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((number) => (
                <React.Fragment key={number}>
                  {number > 1 && (
                    <div
                      className={`h-1 w-full ${
                        step >= number ? "bg-primary-DEFAULT" : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                      step >= number
                        ? "bg-secondary text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {number}
                    <div className="absolute -bottom-6 w-max text-xs text-gray-500">
                      {number === 1 && "Details"}
                      {number === 2 && "Verify Email"}
                      {number === 3 && "Documents"}
                      {number === 4 && "Complete"}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="pt-32">
        {step === 1 && (
          <RegisterForm
            onSubmit={handleRegistrationSubmit}
            translations={translations.register} // Pass only the flat section
          />
        )}

        {step === 2 && registrationData && (
          <EmailVerification email={registrationData.email} />
        )}

        {step === 3 && registrationData && (
          <DocumentUpload
            role={registrationData.role}
            documents={documents}
            onDocumentAdd={handleDocumentAdd}
            onDocumentRemove={handleDocumentRemove}
            onComplete={handleDocumentsComplete}
          />
        )}

        {step === 4 && (
          <SubmissionConfirmation referenceNumber={referenceNumber} />
        )}
      </div>
    </div>
  );
}
