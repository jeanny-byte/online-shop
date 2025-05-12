
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use environment variables or fallback to empty strings to prevent errors
// These will be populated when connected properly to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Some features may not work correctly.');
}

// Create the Supabase client
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

// Function to check if Supabase is properly connected
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
