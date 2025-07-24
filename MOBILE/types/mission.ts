import { Json } from './supabase';
export type UserRole = 'advisor' | 'worker' | 'entrepreneur' | 'admin';
export type ExperienceLevel = 'starter' | 'qualified' | 'expert';
export type MissionStatus =
  | 'in_review'
  | 'online'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'removed';
export type AdvantageType = Array<
  'meal' | 'accommodation' | 'performance_bonus' | 'transport' | 'other'
>;
export type PriceStatus = 'current' | 'not_current';

export interface PriceInfo {
  price: string;
  status: PriceStatus;
}

export interface PromotionInfo {
  amount: string;
  status: 'active' | 'inactive' | 'in_review';
  duration: string;
  start_date: string | null;
  end_date: string | null;
}

export interface MissionRequirement {
  type: 'certification' | 'experience' | 'equipment';
  description: string;
  required: boolean;
}

// export type MissionPayment = 'hourly' | 'fixed' | 'commission';
export type MissionBenefit =
  | 'housing'
  | 'meals'
  | 'transportation'
  | 'insurance';
export type Roles = 'worker' | 'technician' | 'entrepreneur' | 'admin';
export type ActorSpecialization =
  // Worker specializations
  | 'crop_production_worker'
  | 'livestock_worker'
  | 'mechanized_worker'
  | 'specialized_worker'
  | 'seasonal_worker'
  | 'agroforestry_worker'
  | 'nursery_worker'
  | 'aquaculture_worker'
  // Technician specializations (Conseiller agricole)
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

export type SurfaceUnit = 'square_meter' | 'hectares';

export interface Mission {
  id: string;
  user_id: string;
  payment_id: string;
  actor_specialization: ActorSpecialization;
  other_actor_specialization: string;
  needed_actor: UserRole;
  needed_actor_amount: number;
  mission_images: string[];
  mission_title: string;
  mission_description: string;
  location: string;
  start_date: string;
  end_date: string;
  surface_area: number;
  surface_unit: SurfaceUnit;
  required_experience_level: ExperienceLevel;
  equipment: boolean;
  proposed_advantages: AdvantageType;
  original_price: PriceInfo;
  adjustment_price: PriceInfo;
  final_price: string;
  status: MissionStatus;
  is_promoted: PromotionInfo;
  personalized_expression: string | null;
  applicants: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  metadata?: Json;

  // Optional relations (if needed)
  created_by?: {
    id: string;
    name: string;
    role: UserRole;
  };
  requirements?: MissionRequirement[];
}

// Additional types for API responses
export interface MissionCreatePayload
  extends Omit<
    Mission,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'published_at'
    | 'final_price'
    | 'status'
  > {
  status?: MissionStatus;
}

export interface MissionUpdatePayload
  extends Partial<
    Omit<Mission, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  > {}
