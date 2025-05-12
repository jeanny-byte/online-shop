
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Use environment variables or fallback to placeholder values to prevent errors
// These placeholders will just prevent the app from crashing, but won't connect to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Flag to check if we have real Supabase credentials
const hasRealCredentials = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY
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
  return hasRealCredentials;
};
