import { Json } from "./supabase";

export type ActorRank = 'Worker' | 'Technician' | 'Entrepreneur';
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

export type ExperienceLevel = 'starter' | 'qualified' | 'expert';
export type SurfaceUnit = 'hectares' | 'acres';

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
