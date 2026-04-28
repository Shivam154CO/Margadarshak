/**
 * PREDICTIONS.ts — Supabase service for saving and fetching prediction history
 */

import { supabase } from '../../lib/supabase';

export interface PredictionRecord {
  user_id: string;
  college_code: string;
  branch: string;
  category: string;
  user_rank: number;
  cutoff_rank: number;
  admission_chance: number;
  fit_category: string;
  created_at?: string;
}

export async function savePrediction(record: PredictionRecord): Promise<void> {
  // We use .upsert or .insert. Even if the table doesn't exist yet, 
  // having this code ready is better than hardcoding localStorage only.
  try {
    const { error } = await supabase
      .from('predictions_history')
      .insert([record]);

    if (error) {
      if (error.code === '42P01') {
        console.warn('[PredictionService] Table predictions_history does not exist yet. Falling back to local only.');
      } else {
        console.error('[PredictionService] Error saving prediction:', error);
      }
    }
  } catch (e) {
    console.error('[PredictionService] Critical error:', e);
  }
}

export async function getPredictionHistory(userId: string): Promise<PredictionRecord[]> {
  const { data, error } = await supabase
    .from('predictions_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[PredictionService] Error fetching history:', error);
    return [];
  }
  return data || [];
}
