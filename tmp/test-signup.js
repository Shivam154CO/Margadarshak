import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vypalkyefnogrcjvlbfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5cGFsa3llZm5vZ3JjanZsYmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMDU4MzEsImV4cCI6MjA4MTc4MTgzMX0.wZBHG-yjEP3MPU-eX5Tk9YHDvHKCKl6RW-aIonTeFfc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const email = `testuser${randomSuffix}@example.com`;
  const password = 'testpassword123';
  const name = 'Test User';
  const address = '123 test line';

  console.log(`Attempting signup with: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    console.error("signUp Error:", error);
    return;
  }

  console.log("signUp Success. User ID:", data.user?.id);
  console.log("Session details:", data.session ? "Session exists!" : "No session returned.");

  if (data.user) {
    console.log("Attempting insertion into 'users' table...");
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email: email,
        name: name,
        address: address,
        receive_updates: false,
        profile_complete: false
      }]);

    if (profileError) {
      console.error("Profile insertion Error:", profileError);
    } else {
      console.log("Profile successfully inserted!");
    }
  }
}

testSignup();
