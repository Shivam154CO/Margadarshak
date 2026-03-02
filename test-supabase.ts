import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vypalkyefnogrcjvlbfg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    const tables = ['collegess_2025', 'colleges_2025', 'users'];
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`Table ${table}: Error - ${error.message}`);
        } else {
            console.log(`Table ${table}: ${count} rows`);
        }
    }

    // Also check sample data from colleges_2025
    const { data, error: sampleError } = await supabase
        .from('colleges_2025')
        .select('*')
        .limit(2);

    if (data) {
        console.log('Sample data from colleges_2025:', JSON.stringify(data, null, 2));
    } else {
        console.log('Error fetching sample data:', sampleError?.message);
    }
}

checkTables();
