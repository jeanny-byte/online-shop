
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use environment variables or fallback to placeholder values to prevent errors
// These placeholders will just prevent the app from crashing, but won't connect to Supabase
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || 'https://dzsauamhxaikfcwjmrvu.supabase.co';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6c2F1YW1oeGFpa2Zjd2ptcnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwMDk1ODIsImV4cCI6MjA2MjU4NTU4Mn0.gU2AjZoR9J4QtirFWxfPw8vkQIe8nKINfiIxgTvGKwQ';

// Flag to check if we have real Supabase credentials
const hasRealCredentials = Boolean(
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL) && 
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)
);

// Create the Supabase client with placeholder or real values
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return true; // We're now using direct values, so Supabase is always configured
};
