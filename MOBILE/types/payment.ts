import { Json } from "./supabase";

// Payment related types
export type PaymentMethod = 'mobile_payment' | 'bank_transfer' | 'cash' | 'card' | 'crypto';
export type PaymentType = 'mission_payment' | 'refund' | 'bonus' | 'penalty' | 'fee';
export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded'
  | 'expired';

export interface Payment {
  id: string;
  user_id: string;
  user_phone: number;
  payment_method: PaymentMethod;
  payment_reference: string;
  payment_type: PaymentType;
  amount: number;
  otp_code?: number;
  status: PaymentStatus;
  description: string;
  metadata?: Json;
  created_at: string;
  updated_at: string;
  mission_id?: string;
}

// Payload types for API operations
export interface PaymentCreatePayload
  extends Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'status'> {
  status?: PaymentStatus;
}

export interface PaymentUpdatePayload
  extends Partial<
    Omit<Payment, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  > {}

export interface PaymentFilters {
  user_id?: string;
  mission_id?: string;
  payment_method?: PaymentMethod;
  payment_type?: PaymentType;
  status?: PaymentStatus;
  amount_min?: number;
  amount_max?: number;
  date_from?: string;
  date_to?: string;
}

export interface PaymentSummary {
  total_amount: number;
  completed_amount: number;
  pending_amount: number;
  failed_amount: number;
  transaction_count: number;
  success_rate: number;
}

// API Response types
export interface PaymentResponse {
  data: Payment | null;
  error?: string;
}

export interface PaymentsResponse {
  data: Payment[];
  count?: number;
  error?: string;
}

export interface PaymentSummaryResponse {
  data: PaymentSummary | null;
  error?: string;
}