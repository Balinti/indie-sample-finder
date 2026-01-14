// Environment variable helpers with graceful fallbacks

export const env = {
  // Client-side safe
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Price IDs (optional)
  stripeProPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
  stripeProPlusPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID || '',

  // Server-side only
  get supabaseServiceRoleKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  },
  get stripeSecretKey() {
    return process.env.STRIPE_SECRET_KEY || '';
  },
  get stripeWebhookSecret() {
    return process.env.STRIPE_WEBHOOK_SECRET || '';
  },
  get openaiApiKey() {
    return process.env.OPENAI_API_KEY || '';
  },

  // Feature flags based on env availability
  get isSupabaseConfigured() {
    return !!(this.supabaseUrl && this.supabaseAnonKey);
  },
  get isStripeConfigured() {
    return !!this.stripeSecretKey;
  },
  get isOpenAIConfigured() {
    return !!this.openaiApiKey;
  },
  get hasPriceIds() {
    return !!(this.stripeProPriceId || this.stripeProPlusPriceId);
  },
};
