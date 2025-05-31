export type UserRole = 'technician' | 'worker' | 'entrepreneur' | 'admin';
export type ExperienceLevel = 'starter' | 'qualified' | 'expert';
export type MissionStatus =
  | 'in_review'
  | 'online'
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
  | 'precision_agriculture_technician'
  | 'agricultural_equipment_technician'
  | 'crop_and_soil_technician'
  | 'research_and_laboratory_technician'
  | 'livestock_and_airy_technician'
  | 'food_safety_and_quality_technician'
  | 'pest_management_and_environmental_technician'
  | 'inspection_and_certification_technician'
  | 'sales_and_support_technician'
  | 'crop_production_worker'
  | 'livestock_worker'
  | 'mechanized_worker'
  | 'processing_worker'
  | 'specialized_worker'
  | 'seasonal_worker'
  | 'maintenance_worker'
  | 'other';

export type SurfaceUnit = 'square_meters' | 'hectares' | 'acres' | 'square_kilometers';

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
  applicants: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;

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
