/**
 * USERS.ts — Supabase users service for profile and settings
 */

import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types/user';

export async function fetchUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[UserService] fetchUserProfile error:', error);
    throw error;
  }
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[UserService] updateUserProfile error:', error);
    throw error;
  }
  return data as UserProfile;
}

export async function checkProfileCompletion(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('profile_complete')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.profile_complete;
}
