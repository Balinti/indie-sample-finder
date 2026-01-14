-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE palette_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Assets policies
CREATE POLICY "Users can view their own assets"
  ON assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
  ON assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  USING (auth.uid() = user_id);

-- Palettes policies
CREATE POLICY "Users can view their own palettes"
  ON palettes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own palettes"
  ON palettes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own palettes"
  ON palettes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own palettes"
  ON palettes FOR DELETE
  USING (auth.uid() = user_id);

-- Palette items policies
CREATE POLICY "Users can view their own palette items"
  ON palette_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM palettes
      WHERE palettes.id = palette_items.palette_id
      AND palettes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own palette items"
  ON palette_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM palettes
      WHERE palettes.id = palette_items.palette_id
      AND palettes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own palette items"
  ON palette_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM palettes
      WHERE palettes.id = palette_items.palette_id
      AND palettes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own palette items"
  ON palette_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM palettes
      WHERE palettes.id = palette_items.palette_id
      AND palettes.user_id = auth.uid()
    )
  );

-- Receipts policies
CREATE POLICY "Users can view their own receipts"
  ON receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receipts"
  ON receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipts"
  ON receipts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipts"
  ON receipts FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions policies
-- Users can only view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions are managed by webhooks (service role), not users directly
-- But allow users to see their subscription info

-- Storage policies for receipts bucket
-- Run these in Supabase dashboard or via SQL:
--
-- CREATE POLICY "Users can upload their own receipt files"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users can view their own receipt files"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- CREATE POLICY "Users can delete their own receipt files"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'receipts' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
