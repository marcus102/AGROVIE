import { MissionType } from './mission';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface Availability {
  startDate: string;
  endDate: string;
  daysOfWeek: number[]; // 0-6 for Sunday-Saturday
  hoursPerDay: number;
}

export interface PaymentDetails {
  baseRate: {
    technician: number;
    worker: number;
  };
  distanceMultiplier: number;
  complexityFactors: {
    [key: string]: number; // Factor name to multiplier (1.0-2.0)
  };
}

export interface MatchingCriteria {
  jobType: MissionType;
  requiredSkills: Skill[];
  location: Location;
  maxDistance: number; // in kilometers
  availability: Availability;
  minRating?: number;
}

export interface MatchResult {
  userId: string;
  score: number;
  skillMatch: number;
  distanceScore: number;
  availabilityScore: number;
  ratingScore: number;
  pricing: {
    baseRate: number;
    distanceFee: number;
    complexityMultiplier: number;
    finalPrice: number;
  };
}

export interface PaymentStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  amount: number;
  commission: number;
  workerAmount: number;
  paymentMethod: 'orange_money';
  phoneNumber?: string;
  otpCode?: string;
}

export interface ContractStatus {
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  acceptedByWorker: boolean;
  acceptedByEmployer: boolean;
  startDate?: string;
  endDate?: string;
  terms: string[];
  signatures: {
    worker?: string;
    employer?: string;
    timestamp?: string;
  };
}

export interface DisputeStatus {
  isDisputed: boolean;
  reason?: string;
  description?: string;
  evidence?: string[];
  status: 'open' | 'mediation' | 'resolved' | 'closed';
  resolution?: string;
  timestamp?: string;
}