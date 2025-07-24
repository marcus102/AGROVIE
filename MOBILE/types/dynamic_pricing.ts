import { Json } from './supabase';

export type ActorRank = 'Worker' | 'Advisor' | 'Entrepreneur';
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

export type ExperienceLevel = 'starter' | 'qualified' | 'expert';
export type SurfaceUnit =
  | 'hectares'
  | 'square_meter'
  | 'acres'
  | 'square_kilometers';

export interface DynamicPricing {
  id: string;
  actor_rank: ActorRank;
  actor_specialization2: ActorSpecialization;
  experience_level: ExperienceLevel;
  surface_unit2: SurfaceUnit;
  specialization_base_price: number;
  experience_multiplier: number;
  surface_unit_price: number;
  price_per_kilometer: number;
  price_per_hour: number;
  equipments_price: number;
  advantages_reduction: number;
  metadata: Json;
  created_at: Date;
  updated_at: Date;
}
