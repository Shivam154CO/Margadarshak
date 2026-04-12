import { createClient } from '@supabase/supabase-js';

/**
 * Validates and retrieves environment variables.
 * Throws a descriptive error if variables are missing.
 */
const getEnvVar = (name: string): string => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. Please check your .env file.`);
  }
  return value as string;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);