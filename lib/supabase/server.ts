import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

// Server-side Supabase client using service role key
// Only use this in API routes, never expose to client
export const getSupabaseAdmin = () => {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
