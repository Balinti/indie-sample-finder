import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Client-side Supabase client using anon key
export const supabase = env.isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey)
  : null;

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => supabase !== null;
