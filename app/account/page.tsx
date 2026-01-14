'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseAvailable } from '@/lib/supabase/client';
import { Pricing } from '@/components/Pricing';
import { SubscriptionTier } from '@/lib/stripe';

interface UserProfile {
  email: string;
  tier: SubscriptionTier;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSupabaseAvailable()) {
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase!.auth.getUser();

      if (!user) {
        router.push('/auth');
        return;
      }

      // Get subscription info
      const { data: subscription } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let tier: SubscriptionTier = 'free';
      if (subscription?.status === 'active' || subscription?.status === 'trialing') {
        // Determine tier from price_id
        const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
        const proPlusPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID;

        if (subscription.price_id === proPlusPriceId) {
          tier = 'pro_plus';
        } else if (subscription.price_id === proPriceId) {
          tier = 'pro';
        }
      }

      setProfile({
        email: user.email || '',
        tier,
        subscriptionStatus: subscription?.status || null,
        currentPeriodEnd: subscription?.current_period_end || null,
      });
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSignOut = async () => {
    if (!isSupabaseAvailable()) return;
    await supabase!.auth.signOut();
    router.push('/');
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.disabled) {
        alert('Billing management is not configured.');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal.');
    }
    setPortalLoading(false);
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.disabled) {
        alert('Upgrades are not configured at this time.');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      alert('Failed to start upgrade process.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isSupabaseAvailable() || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
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
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Please sign in to view your account.</p>
            <Link
              href="/auth"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign in
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const tierNames = {
    free: 'Free',
    pro: 'Pro',
    pro_plus: 'Pro+',
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
            <div className="flex items-center gap-4">
              <Link
                href="/app"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Go to app
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account</h1>

          {/* Profile section */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>
          </section>

          {/* Subscription section */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current plan</p>
                  <p className="font-medium text-lg">{tierNames[profile.tier]}</p>
                  {profile.subscriptionStatus && (
                    <p className="text-sm text-gray-500 capitalize">
                      Status: {profile.subscriptionStatus}
                    </p>
                  )}
                  {profile.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      Renews:{' '}
                      {new Date(profile.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {profile.tier !== 'free' && (
                  <button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    {portalLoading ? 'Loading...' : 'Manage billing'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Upgrade section */}
          {profile.tier === 'free' && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Upgrade your plan</h2>
              <Pricing currentTier={profile.tier} onUpgrade={handleUpgrade} />
            </section>
          )}

          {/* Data sync section */}
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold mb-4">Data</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your local library data is automatically synced when you sign in. Data
              stored locally remains available offline.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Account synced
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
