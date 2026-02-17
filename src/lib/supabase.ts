import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vypalkyefnogrcjvlbfg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);