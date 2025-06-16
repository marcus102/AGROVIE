import { Json } from './supabase';
export type DynamicLink = {
  id: string;
  link_title: string;
  link_description: string;
  link: string;
  category: string;
  metadata: Json;
  is_active: boolean;
  updated_at: string | null;
  created_at: string;
};