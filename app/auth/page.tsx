'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseAvailable } from '@/lib/supabase/client';
import { getExportPayload, markSyncedToCloud } from '@/lib/storage/localState';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!isSupabaseAvailable()) {
      setError('Authentication is not configured. Please try again later.');
      return;
    }

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase!.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        setMessage(
          'Check your email for a confirmation link. You can close this page.'
        );
      } else {
        const { data, error: signInError } = await supabase!.auth.signInWithPassword(
          {
            email,
            password,
          }
        );

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data.user) {
          // Migrate local data to cloud
          const payload = getExportPayload();
          if (
            payload.assets.length > 0 ||
            payload.palettes.length > 0 ||
            payload.receipts.length > 0
          ) {
            try {
              await fetch('/api/sync/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });
              markSyncedToCloud();
            } catch (syncError) {
              console.error('Failed to sync local data:', syncError);
              // Continue anyway - data is still local
            }
          }

          router.push('/account');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="w-7 h-7 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span className="font-semibold">Indie Sample Finder</span>
            </Link>
            <Link
              href="/app"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Back to app
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8">
            <h1 className="text-2xl font-bold text-center mb-6">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>

            {!isSupabaseAvailable() && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Authentication is not configured. You can still use the app without
                  signing in.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="you@example.com"
                  disabled={loading || !isSupabaseAvailable()}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
                  disabled={loading || !isSupabaseAvailable()}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {message}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !isSupabaseAvailable()}
                className="w-full py-2.5 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'signin' ? (
                <p className="text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-indigo-600 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className="text-indigo-600 hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/legal/terms" className="underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/legal/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
