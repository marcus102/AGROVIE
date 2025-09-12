export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'worker' | 'advisor' | 'entrepreneur' | 'admin';
          super_role:
            | 'user'
            | 'admin'
            | 'organization'
            | 'government'
            | 'moderator'
            | 'technology'
            | 'law'
            | 'finance';
          nationality: 'national' | 'international' | 'foreign';
          full_name: string;
          phone: string | null;
          profile_picture: string | null;
          actual_location: string | null;
          bio: string | null;
          portfolio: string[] | null;
          certifications: string[] | null;
          education: string[] | null;
          languages: string[] | null;
          skills: string[] | null;
          work_experience: string[] | null;
          availability_locations: string[] | null;
          specialization:
            | 'crop_production_worker'
            | 'livestock_worker'
            | 'mechanized_worker'
            | 'specialized_worker'
            | 'seasonal_worker'
            | 'agroforestry_worker'
            | 'nursery_worker'
            | 'aquaculture_worker'
            | 'horticulture_market_gardening'
            | 'fruit_cultivation_orchard'
            | 'irrigation'
            | 'agricultural_machinery'
            | 'livestock_farming'
            | 'smart_agriculture'
            | 'agricultural_drone'
            | 'large_scale_production'
            | 'phytosanitary'
            | 'soil_science'
            | 'agricultural_development'
            | 'project_management'
            | 'agroecology'
            | 'farm_management'
            | 'agrifood'
            | 'rural_land'
            | 'aquaculture'
            | 'other';
          other_specialization: string | null;
          availability_status: 'available' | 'not_available';
          verification_status: 'not_verified' | 'verified';
          docs_status: 'not_uploaded' | 'pending' | 'accepted' | 'rejected';
          status: 'active' | 'inactive' | 'suspended';
          active: boolean;
          account_status: 'healthy' | 'warning' | 'suspended' | 'deleted';
          account_verified: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: 'worker' | 'advisor' | 'entrepreneur';
          full_name: string;
          phone?: string | null;
          verification_status?:
            | 'pending'
            | 'in_review'
            | 'approved'
            | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'worker' | 'advisor' | 'entrepreneur';
          full_name?: string;
          phone?: string | null;
          verification_status?:
            | 'pending'
            | 'in_review'
            | 'approved'
            | 'rejected';

          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          identification_type: 'id_card' | 'passport' | 'driving_license';
          id_file_path: string;
          legal_document_type:
            | 'business'
            | 'certification'
            | 'work_permit'
            | 'insurance'
            | 'experience';
          legal_file_path: string;
          status: 'pending' | 'approved' | 'rejected';
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | 'id'
            | 'business'
            | 'certification'
            | 'work_permit'
            | 'insurance'
            | 'experience';
          file_path: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | 'id'
            | 'business'
            | 'certification'
            | 'work_permit'
            | 'insurance'
            | 'experience';
          file_path?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'worker' | 'technician' | 'entrepreneur';
      verification_status: 'pending' | 'in_review' | 'approved' | 'rejected';
      document_type:
        | 'id'
        | 'business'
        | 'certification'
        | 'work_permit'
        | 'insurance'
        | 'experience';
      document_status: 'pending' | 'approved' | 'rejected';
    };
  };
}
