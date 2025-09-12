// Types for mission creation
export type UserRole = 'worker' | 'advisor' | 'entrepreneur';
export type ExperienceLevel = 'starter' | 'qualified' | 'expert';
export type AdvantageType =
  | 'meal'
  | 'accommodation'
  | 'performance_bonus'
  | 'transport'
  | 'other';
export type SurfaceUnit = 'hectares' | 'square_meter';

export interface FormData {
  mission_title: string;
  mission_description: string;
  location: string;
  start_date: string;
  end_date: string;
  needed_actor: UserRole;
  actor_specialization: string;
  other_actor_specialization: string;
  needed_actor_amount: number;
  required_experience_level: ExperienceLevel;
  surface_area: number;
  surface_unit: SurfaceUnit;
  equipment: boolean;
  proposed_advantages: AdvantageType[];
  original_price: string;
  adjustment_price: string;
  final_price: string;
  mission_images: string[];
  personalized_expression: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface CreateMissionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: FormErrors;
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>;
  colors: any;
}
