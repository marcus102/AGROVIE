export interface QuickStart {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  mission_data: Record<string, any>;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuickStartCreatePayload {
  title: string;
  description?: string;
  mission_data: Record<string, any>;
}