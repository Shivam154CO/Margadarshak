import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vypalkyefnogrcjvlbfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Checking columns of 'users' table...");
  
  // Try to insert a mock profile to see the exact database error
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert([{
      id: fakeId,
      email: 'test@example.com',
      name: 'Test user',
      address: 'Test address',
      receive_updates: false,
      profile_complete: false
    }]);

  if (insertError) {
    console.error("INSERT ERROR:", insertError);
  } else {
    console.log("INSERT SUCCESS:", insertData);
  }
}

test();
