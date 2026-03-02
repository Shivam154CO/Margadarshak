import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vypalkyefnogrcjvlbfg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listTables() {
    // There is no direct way to list tables via JS client without a special function,
    // but we can try to query common ones or check a system table if allowed.
    // Instead, let's just check 'colleges' (without 2025)

    const possibleTables = ['colleges', 'college_details', 'college_data', 'collegess_2025', 'colleges_2025'];
    for (const table of possibleTables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error) {
            console.log(`Found table: ${table} with ${count} rows`);
        }
    }
}

listTables();
