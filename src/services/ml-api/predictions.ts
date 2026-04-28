/**
 * PREDICTIONS.ts — ML API service for college admission predictions
 */

import axios from 'axios';
import type { PredictionRequest, PredictionResponse, OCRResponse, CapFormResponse } from '../../types/api';
import { ML_API_FALLBACK_URL } from '../../constants/app';
import { savePrediction } from '../supabase/predictions';

const ML_API_URL = import.meta.env.VITE_ML_API_URL || ML_API_FALLBACK_URL;

export async function predictAdmission(request: PredictionRequest, userId?: string): Promise<PredictionResponse> {
  try {
    const response = await axios.post(`${ML_API_URL}/predict_admission`, request, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });

    const data = response.data as PredictionResponse;

    // Bridge the "Missing Link": Save top 3 predictions to history if userId is provided
    if (userId && data.colleges && data.colleges.length > 0) {
      const topPredictions = data.colleges.slice(0, 3);
      Promise.all(topPredictions.map(c => savePrediction({
        user_id: userId,
        college_code: c.college_code,
        branch: c.branch || c.branch_name || 'General',
        category: request.category || 'OPEN',
        user_rank: request.rank || 0,
        cutoff_rank: c.cutoff_rank || 0,
        admission_chance: typeof c.admission_chance === 'number' ? c.admission_chance : (parseFloat(c.admission_chance_percentage || '0') || 0),
        fit_category: String(c.probability_level || c.fit || 'Unknown')
      }))).catch(err => console.error("Background history save failed:", err));
    }

    if (data.colleges) {
      return data;
    }
    throw new Error('API response missing colleges data');
  } catch (error) {
    console.error('[ML-API] predictAdmission error:', error);
    throw error;
  }
}

export async function generateCapForm(request: { rank: number; score: number; category: string; branches: string[] }): Promise<CapFormResponse> {
    try {
      const response = await axios.post(`${ML_API_URL}/generate_cap_form`, request, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return response.data as CapFormResponse;
    } catch (error) {
      console.error('[ML-API] generateCapForm error:', error);
      throw error;
    }
  }
  
  export async function extractScorecard(file: File): Promise<OCRResponse> {
    const formData = new FormData();
    formData.append('document', file);
  
    try {
      const response = await axios.post(`${ML_API_URL}/extract_scorecard`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Axios handles boundaries
        timeout: 15000,
      });
      return response.data as OCRResponse;
    } catch (error) {
      console.error('[ML-API] extractScorecard error:', error);
      throw error;
    }
  }
