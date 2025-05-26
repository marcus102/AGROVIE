export type VerificationStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface VerificationDocument {
  id: string;
  type: 'id' | 'business_registration' | 'certification' | 'work_permit';
  status: VerificationStatus;
  uploadedAt: string;
  reviewedAt?: string;
  expiresAt?: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  notes?: string;
}

export interface VerificationRequirement {
  id: string;
  type: VerificationDocument['type'];
  required: boolean;
  maxSize: number; // in MB
  allowedTypes: string[];
  description: string;
  helpText?: string;
}

export interface RoleVerification {
  role: 'entrepreneur' | 'technician' | 'worker';
  status: VerificationStatus;
  documents: VerificationDocument[];
  requirements: VerificationRequirement[];
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}