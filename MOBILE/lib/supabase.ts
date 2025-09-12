import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize the Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Helper function to validate verification code format
export const isValidVerificationCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

// Helper function to validate file upload
export const isValidFileUpload = (file: File): boolean => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  return file.size <= maxSize && allowedTypes.includes(file.type);
};

// Helper function to sanitize input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Helper function to handle rate limiting
let lastAttempt = 0;
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_ATTEMPTS = 3;

export const checkRateLimit = (): boolean => {
  const now = Date.now();
  if (now - lastAttempt < RATE_LIMIT_WINDOW) {
    return false;
  }
  lastAttempt = now;
  return true;
};

// Storage bucket helpers
export const getStorageUrl = (path: string): string => {
  return `${supabaseUrl}/storage/v1/object/public/${path}`;
};

export const uploadDocument = async (
  file: File,
  userId: string,
  documentType: string
): Promise<string> => {
  if (!isValidFileUpload(file)) {
    throw new Error('Invalid file');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);

  if (error) throw error;
  return fileName;
};

// Session management
export const refreshSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: { user }, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return user;
};

// Profile management
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
  return data;
};

// Document management
export const getUserDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

export const updateDocumentStatus = async (
  documentId: string,
  status: 'pending' | 'approved' | 'rejected'
) => {
  const { data, error } = await supabase
    .from('user_documents')
    .update({ status })
    .eq('id', documentId);

  if (error) throw error;
  return data;
};