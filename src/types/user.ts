/**
 * USER.ts — User related type definitions for Ikigai
 */

import type { Category, ExamType } from '../constants/app';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  state: string;
  category: Category;
  exam_type: ExamType;
  cet_rank: string;
  cet_score: string;
  diploma_rank: string;
  diploma_score: string;
  preferred_branches: string[];
  university_preference: string;
  address: string;
  receive_updates: boolean;
  profile_complete: boolean;
  
  // Formal Option Form fields
  application_id?: string;
  candidature_type?: string;
  ews_status?: string;
  gender?: string;
  pwd_type?: string;
  defence_type?: string;
  religious_minority?: string;
  linguistic_minority?: string;
  diploma_course_group?: string;
  
  // Extra fields from ProfileView
  home_university?: string;
  phone?: string;
  tenth_percentage?: number;
  twelfth_percentage?: number;
  digilocker_verified?: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null; // Supabase user
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}
