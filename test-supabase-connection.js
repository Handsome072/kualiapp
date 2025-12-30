// Simple test script to verify Supabase connection
// Run with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hvtsmovlsppvuncgvjvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dHNtb3Zsc3BwdnVuY2d2anZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NzI5NzcsImV4cCI6MjA1MTA0ODk3N30.ydvZhLkPa763U7d7YMvf4g_WO21Jw1-';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('✓ Supabase client created successfully');
    console.log(`  URL: ${supabaseUrl}`);
    
    // Test 2: Try to get the current session (should be null if not logged in)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('✗ Session check failed:', sessionError.message);
    } else {
      console.log('✓ Session check successful');
      console.log(`  Current session: ${session ? 'Logged in' : 'Not logged in'}`);
    }
    
    // Test 3: Check if we can access the profiles table (will fail if not set up)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('\n⚠️  Database tables not set up yet!');
        console.log('   Please run the SQL from supabase-schema.sql in your Supabase SQL Editor');
      } else {
        console.log('✗ Database query failed:', error.message);
      }
    } else {
      console.log('✓ Database connection successful');
      console.log('  Tables are set up correctly');
    }
    
    console.log('\n✅ Connection test complete!');
    console.log('\nNext steps:');
    console.log('1. If tables are not set up, run supabase-schema.sql in Supabase SQL Editor');
    console.log('2. Start the dev server: npm run dev');
    console.log('3. Open http://localhost:3000 and try signing up');
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
  }
}

testConnection();

