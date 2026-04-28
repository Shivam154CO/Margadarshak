/**
 * API.ts — API response and request shapes for Ikigai
 */

import type { College } from './college';
import type { Category } from '../constants/app';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PredictionRequest {
  score: number;
  rank: number;
  category: Category;
  branches: string[];
  limit?: number;
}

export interface PredictionResponse {
  colleges: College[];
  ai_insights?: string;
  dream_list?: College[];
  metadata?: {
    total_count: number;
    prediction_time: string;
  };
}

export interface OCRResponse {
  success: boolean;
  data: {
    name?: string;
    seat_no?: string;
    percentile?: number;
    rank?: number;
    category?: string;
    marks?: Record<string, number>;
  };
  error?: string;
}

export interface CapFormItem {
  college_code: string;
  college_name: string;
  branch_name: string;
  cutoff_rank: number;
  admission_chance: number;
  probability_level: string;
  fit: string;
}

export interface CapFormResponse {
  form: {
    dream: CapFormItem[];
    best_fit: CapFormItem[];
    safe: CapFormItem[];
  };
}
