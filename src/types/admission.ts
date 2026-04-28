import type { College } from './college';

export interface PredictionHistory {
  id: string;
  user_id: string;
  college_code: string;
  branch_code: string;
  admission_chance: number;
  match_score: number;
  category: string;
  rank: number;
  percentile: number;
  created_at: string;
  // Join data
  college?: Partial<College>;
}

export interface CapRound {
  id: string;
  round_number: number;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
}

export interface UserOptionForm {
  id: string;
  user_id: string;
  round_id: string;
  choices: {
    college_code: string;
    branch_code: string;
    preference_order: number;
  }[];
  is_submitted: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdmissionDocument {
  id: string;
  user_id: string;
  document_name: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  file_url?: string;
  verified_at?: string;
  rejection_reason?: string;
}
