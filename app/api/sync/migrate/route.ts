import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

interface LocalAsset {
  id: string;
  title: string;
  originalFilename: string;
  contentHash: string;
  durationMs: number;
  rms: number;
  spectralCentroid?: number;
  descriptor: string;
  embedding: number[] | null;
  tags: string[];
  createdAt: number;
}

interface LocalPalette {
  id: string;
  name: string;
  notes: string;
  assetIds: string[];
  createdAt: number;
}

interface LocalReceipt {
  id: string;
  assetId: string;
  sourceUrl: string;
  notes: string;
  licenseFlags: Record<string, boolean>;
  createdAt: number;
}

interface MigratePayload {
  assets: LocalAsset[];
  palettes: LocalPalette[];
  receipts: LocalReceipt[];
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin || !env.isSupabaseConfigured) {
      return NextResponse.json({ disabled: true });
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey);

    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: MigratePayload = await request.json();

    // Create or update profile
    await supabaseAdmin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // Migrate assets
    const assetIdMap = new Map<string, string>(); // local ID -> server ID
    for (const asset of payload.assets) {
      const { data: existingAsset } = await supabaseAdmin
        .from('assets')
        .select('id')
        .eq('user_id', user.id)
        .eq('content_hash', asset.contentHash)
        .single();

      if (existingAsset) {
        assetIdMap.set(asset.id, existingAsset.id);
      } else {
        const { data: newAsset, error } = await supabaseAdmin
          .from('assets')
          .insert({
            user_id: user.id,
            title: asset.title,
            original_filename: asset.originalFilename,
            content_hash: asset.contentHash,
            duration_ms: asset.durationMs,
            rms: asset.rms,
            descriptor: asset.descriptor,
            embedding: asset.embedding,
            created_at: new Date(asset.createdAt).toISOString(),
          })
          .select('id')
          .single();

        if (newAsset && !error) {
          assetIdMap.set(asset.id, newAsset.id);
        }
      }
    }

    // Migrate palettes
    for (const palette of payload.palettes) {
      const { data: existingPalette } = await supabaseAdmin
        .from('palettes')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', palette.name)
        .single();

      let paletteId: string;

      if (existingPalette) {
        paletteId = existingPalette.id;
        await supabaseAdmin
          .from('palettes')
          .update({
            notes: palette.notes,
          })
          .eq('id', paletteId);
      } else {
        const { data: newPalette, error } = await supabaseAdmin
          .from('palettes')
          .insert({
            user_id: user.id,
            name: palette.name,
            notes: palette.notes,
            created_at: new Date(palette.createdAt).toISOString(),
          })
          .select('id')
          .single();

        if (!newPalette || error) continue;
        paletteId = newPalette.id;
      }

      // Add palette items
      for (let i = 0; i < palette.assetIds.length; i++) {
        const localAssetId = palette.assetIds[i];
        const serverAssetId = assetIdMap.get(localAssetId);

        if (serverAssetId) {
          await supabaseAdmin.from('palette_items').upsert(
            {
              palette_id: paletteId,
              asset_id: serverAssetId,
              position: i,
            },
            { onConflict: 'palette_id,asset_id' }
          );
        }
      }
    }

    // Migrate receipts
    for (const receipt of payload.receipts) {
      const serverAssetId = assetIdMap.get(receipt.assetId);
      if (!serverAssetId) continue;

      const { data: existingReceipt } = await supabaseAdmin
        .from('receipts')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', serverAssetId)
        .single();

      if (existingReceipt) {
        await supabaseAdmin
          .from('receipts')
          .update({
            source_url: receipt.sourceUrl,
            notes: receipt.notes,
            license_flags: receipt.licenseFlags,
          })
          .eq('id', existingReceipt.id);
      } else {
        await supabaseAdmin.from('receipts').insert({
          user_id: user.id,
          asset_id: serverAssetId,
          source_url: receipt.sourceUrl,
          notes: receipt.notes,
          license_flags: receipt.licenseFlags,
          created_at: new Date(receipt.createdAt).toISOString(),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      migrated: {
        assets: payload.assets.length,
        palettes: payload.palettes.length,
        receipts: payload.receipts.length,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}
