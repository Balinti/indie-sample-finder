-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- Note: pgvector extension may need to be enabled by Supabase admin
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT,
  original_filename TEXT,
  content_hash TEXT,
  duration_ms INT,
  rms REAL,
  descriptor TEXT,
  -- Embedding stored as JSONB (fallback if pgvector not available)
  -- If pgvector is available, this can be: embedding vector(1536)
  embedding JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_content_hash ON assets(user_id, content_hash);

-- Palettes table
CREATE TABLE IF NOT EXISTS palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_palettes_user_id ON palettes(user_id);

-- Palette items (junction table)
CREATE TABLE IF NOT EXISTS palette_items (
  palette_id UUID REFERENCES palettes ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets ON DELETE CASCADE NOT NULL,
  position INT DEFAULT 0,
  PRIMARY KEY (palette_id, asset_id)
);

-- Receipts table (license information)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES assets ON DELETE CASCADE,
  storage_path TEXT,
  source_url TEXT,
  notes TEXT,
  license_flags JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_asset_id ON receipts(asset_id);

-- Subscriptions table (Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT,
  price_id TEXT,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Create storage bucket for receipts (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
