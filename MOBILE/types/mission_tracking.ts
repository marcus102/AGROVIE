export interface MissionTracking {
  id: string;
  mission_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  completion_rate: number;
  time_worked: number;
  earnings: number;
  status: 'active' | 'completed' | 'paused';
  tasks_completed: number;
  total_tasks: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MissionEmployee {
  id: string;
  mission_id: string;
  user_id: string;
  profile: {
    id: string;
    full_name: string;
    profile_picture: string | null;
    role: string;
    specialization: string;
  };
  tracking: MissionTracking;
  status: 'active' | 'completed' | 'left';
  joined_at: string;
}