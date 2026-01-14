'use client';

import { useState, useEffect } from 'react';
import { env } from '@/lib/env';
import { TIER_LIMITS } from '@/lib/stripe';

interface PricingProps {
  currentTier?: 'free' | 'pro' | 'pro_plus';
  onUpgrade?: (priceId: string) => void;
}

export function Pricing({ currentTier = 'free', onUpgrade }: PricingProps) {
  const [isStripeConfigured, setIsStripeConfigured] = useState(false);
  const [hasPriceIds, setHasPriceIds] = useState(false);

  useEffect(() => {
    setIsStripeConfigured(!!env.stripePublishableKey);
    setHasPriceIds(env.hasPriceIds);
  }, []);

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      tier: 'free' as const,
      priceId: null,
      features: [
        `${TIER_LIMITS.free.maxAssets} samples`,
        `${TIER_LIMITS.free.maxPalettes} palettes`,
        `${TIER_LIMITS.free.maxSimilarityResults} similarity results`,
        'Basic export',
        'Local storage',
      ],
      cta: currentTier === 'free' ? 'Current Plan' : 'Downgrade',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      tier: 'pro' as const,
      priceId: env.stripeProPriceId,
      features: [
        `${TIER_LIMITS.pro.maxAssets} samples`,
        `${TIER_LIMITS.pro.maxPalettes} palettes`,
        `${TIER_LIMITS.pro.maxSimilarityResults} similarity results`,
        'PDF license snapshots',
        'Receipt file uploads',
        'Cloud sync',
      ],
      cta: currentTier === 'pro' ? 'Current Plan' : 'Upgrade',
      highlighted: true,
    },
    {
      name: 'Pro+',
      price: '$19',
      period: '/month',
      tier: 'pro_plus' as const,
      priceId: env.stripeProPlusPriceId,
      features: [
        'Unlimited samples',
        'Unlimited palettes',
        `${TIER_LIMITS.pro_plus.maxSimilarityResults} similarity results`,
        'Everything in Pro',
        'Priority support',
        'Early access to features',
      ],
      cta: currentTier === 'pro_plus' ? 'Current Plan' : 'Upgrade',
      highlighted: false,
    },
  ];

  const handleUpgrade = async (priceId: string | null) => {
    if (!priceId) return;
    onUpgrade?.(priceId);
  };

  // Hide entire pricing section if Stripe not configured
  if (!isStripeConfigured || !hasPriceIds) {
    return (
      <div className="py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Free to Use</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start organizing your samples now. No account required for basic features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Pricing</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-6 ${
                tier.highlighted
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 scale-105'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <h3
                className={`text-xl font-semibold ${
                  tier.highlighted ? 'text-white' : ''
                }`}
              >
                {tier.name}
              </h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span
                  className={`text-sm ${
                    tier.highlighted ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {tier.period}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${
                        tier.highlighted ? 'text-indigo-200' : 'text-green-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.priceId)}
                disabled={currentTier === tier.tier || !tier.priceId}
                className={`mt-8 w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50 disabled:bg-indigo-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700'
                } disabled:cursor-not-allowed`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
