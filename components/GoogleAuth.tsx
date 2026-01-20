'use client';

import { useState, useEffect } from 'react';

// Hardcoded Supabase config - shared across all apps
const SUPABASE_URL = 'https://api.srv936332.hstgr.cloud';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE';
const APP_SLUG = 'indie-sample-finder';

interface User {
  email: string;
  id: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let supabaseClient: any = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  // Dynamically import Supabase
  const { createClient } = await import('@supabase/supabase-js');
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

async function trackUserLogin(userId: string, email: string) {
  try {
    const supabase = await getSupabase();
    const now = new Date().toISOString();

    // Try to get existing record
    const { data: existing } = await supabase
      .from('user_tracking')
      .select('login_cnt')
      .eq('user_id', userId)
      .eq('app', APP_SLUG)
      .single();

    if (existing) {
      // Update existing record - increment login count
      await supabase
        .from('user_tracking')
        .update({
          login_cnt: existing.login_cnt + 1,
          last_login_ts: now,
          email: email
        })
        .eq('user_id', userId)
        .eq('app', APP_SLUG);
    } else {
      // Insert new record
      await supabase
        .from('user_tracking')
        .insert({
          user_id: userId,
          email: email,
          app: APP_SLUG,
          login_cnt: 1,
          last_login_ts: now
        });
    }
  } catch (error) {
    console.error('Failed to track user login:', error);
  }
}

export function GoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const supabase = await getSupabase();

        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session?.user) {
          setUser({ email: session.user.email || '', id: session.user.id });
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: string, session: { user: { email?: string; id: string } } | null) => {
            if (!mounted) return;

            if (session?.user) {
              setUser({ email: session.user.email || '', id: session.user.id });

              // Track login on SIGNED_IN event
              if (event === 'SIGNED_IN') {
                await trackUserLogin(session.user.id, session.user.email || '');
              }
            } else {
              setUser(null);
            }
          }
        );

        if (mounted) setLoading(false);

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="text-sm px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Sign in with Google
    </button>
  );
}
