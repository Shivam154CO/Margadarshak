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
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: any | null; // Supabase user
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}
