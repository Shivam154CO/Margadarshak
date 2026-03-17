/**
 * PREDICTIONS.ts — ML API service for college admission predictions
 */

import axios from 'axios';
import type { PredictionRequest, PredictionResponse } from '../../types/api';
import { ML_API_FALLBACK_URL } from '../../constants/app';

const ML_API_URL = import.meta.env.VITE_ML_API_URL || ML_API_FALLBACK_URL;

export async function predictAdmission(request: PredictionRequest): Promise<PredictionResponse> {
  try {
    const response = await axios.post(`${ML_API_URL}/predict_admission`, request, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });

    if (response.data.colleges) {
      return response.data as PredictionResponse;
    }
    throw new Error('API response missing colleges data');
  } catch (error) {
    console.error('[ML-API] predictAdmission error:', error);
    throw error;
  }
}

export async function generateCapForm(request: any): Promise<any> {
    try {
      const response = await axios.post(`${ML_API_URL}/generate_cap_form`, request, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('[ML-API] generateCapForm error:', error);
      throw error;
    }
  }
  
  export async function extractScorecard(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('document', file);
  
    try {
      const response = await axios.post(`${ML_API_URL}/extract_scorecard`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }, // Axios handles boundaries
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error('[ML-API] extractScorecard error:', error);
      throw error;
    }
  }
