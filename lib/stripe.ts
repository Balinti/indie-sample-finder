import Stripe from 'stripe';
import { env } from './env';

// Server-side Stripe instance
export const getStripe = () => {
  if (!env.stripeSecretKey) return null;
  return new Stripe(env.stripeSecretKey);
};

// Subscription tier helpers
export type SubscriptionTier = 'free' | 'pro' | 'pro_plus';

export function getTierFromPriceId(priceId: string | null): SubscriptionTier {
  if (!priceId) return 'free';
  if (priceId === env.stripeProPlusPriceId) return 'pro_plus';
  if (priceId === env.stripeProPriceId) return 'pro';
  return 'free';
}

// Tier limits
export const TIER_LIMITS = {
  free: {
    maxAssets: 50,
    maxPalettes: 5,
    maxSimilarityResults: 5,
    canExportPdf: false,
    canUploadReceipts: false,
  },
  pro: {
    maxAssets: 500,
    maxPalettes: 50,
    maxSimilarityResults: 20,
    canExportPdf: true,
    canUploadReceipts: true,
  },
  pro_plus: {
    maxAssets: -1, // unlimited
    maxPalettes: -1,
    maxSimilarityResults: 50,
    canExportPdf: true,
    canUploadReceipts: true,
  },
};

export function getTierLimits(tier: SubscriptionTier) {
  return TIER_LIMITS[tier];
}
