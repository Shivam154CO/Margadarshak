/**
 * COLLEGES.ts — Supabase colleges and related data service
 */

import { supabase } from '../../lib/supabase';
import type { College, Feedback } from '../../types/college';

export async function fetchAllColleges(limit = 100000): Promise<College[]> {
  const { data, error } = await supabase
    .from('colleges_2025')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('[CollegeService] fetchAllColleges error:', error);
    throw error;
  }
  return (data as College[]) || [];
}

export async function fetchCollegeByCode(collegeCode: string): Promise<College | null> {
  const { data, error } = await supabase
    .from('colleges_2025')
    .select('*')
    .eq('college_code', collegeCode)
    .single();

  if (error) {
    console.error('[CollegeService] fetchCollegeByCode error:', error);
    return null;
  }
  return data as College;
}

export async function fetchCollegeReviews(collegeCode: string): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('college_reviews_with_profiles')
    .select('*')
    .eq('college_code', collegeCode)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CollegeService] fetchCollegeReviews error:', error);
    throw error;
  }
  return (data as Feedback[]) || [];
}

export async function fetchAllReviews(limit = 50): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from('college_reviews_with_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[CollegeService] fetchAllReviews error:', error);
    throw error;
  }
  return (data as Feedback[]) || [];
}

export async function upvoteReview(reviewId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_upvote', {
    review_id: reviewId,
    user_id: userId
  });

  if (error) {
    console.error('[CollegeService] upvoteReview error:', error);
    throw error;
  }
}
