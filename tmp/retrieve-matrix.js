import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vypalkyefnogrcjvlbfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectPICT() {
  const { data: rows, error } = await supabase
    .from('colleges_2025')
    .select('branch_name, branch_code, category, seats, total_intake')
    .eq('college_code', '6271');

  if (error) {
    console.error("Error:", error);
    return;
  }

  // Filter for Computer Engineering
  const compEnggRows = rows.filter(r => r.branch_name.toLowerCase().includes('computer'));
  console.log(`Found ${compEnggRows.length} rows for Computer Engineering at PICT:`);
  compEnggRows.forEach(r => {
    console.log(`Branch Name: "${r.branch_name}", branch_code: "${r.branch_code}", Category: ${r.category}, Seats: ${r.seats}, total_intake: ${r.total_intake}`);
  });
}

inspectPICT();
