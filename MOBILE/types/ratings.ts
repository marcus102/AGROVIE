export interface UserRating {
  id: string;
  mission_id: string;
  rater_id: string;
  rated_user_id: string;
  rating: number; // 1-5
  comment: string | null;
  rating_type: 'employer_to_employee' | 'employee_to_employer';
  created_at: string;
}

export interface SystemRating {
  id: string;
  user_id: string;
  rating: number; // 1-5
  factors: {
    punctuality: number;
    quality: number;
    communication: number;
    reliability: number;
  };
  period_start: string;
  period_end: string;
  created_at: string;
}