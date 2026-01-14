// localStorage-based state management for metadata, palettes, and receipts

export interface LocalAsset {
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

export interface LocalPalette {
  id: string;
  name: string;
  notes: string;
  assetIds: string[];
  createdAt: number;
}

export interface LocalReceipt {
  id: string;
  assetId: string;
  sourceUrl: string;
  notes: string;
  licenseFlags: Record<string, boolean>;
  createdAt: number;
}

export interface LocalState {
  version: number;
  assets: LocalAsset[];
  palettes: LocalPalette[];
  receipts: LocalReceipt[];
  engagement: {
    similaritySearchCount: number;
    palettesCreated: number;
    assetsAdded: number;
    signupPromptShown: boolean;
    syncedToCloud: boolean;
  };
}

const STORAGE_KEY = 'indie-sample-finder-state';
const CURRENT_VERSION = 1;

function getDefaultState(): LocalState {
  return {
    version: CURRENT_VERSION,
    assets: [],
    palettes: [],
    receipts: [],
    engagement: {
      similaritySearchCount: 0,
      palettesCreated: 0,
      assetsAdded: 0,
      signupPromptShown: false,
      syncedToCloud: false,
    },
  };
}

export function getLocalState(): LocalState {
  if (typeof window === 'undefined') return getDefaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultState();

    const parsed = JSON.parse(stored) as LocalState;
    // Migration logic can go here if version changes
    if (parsed.version !== CURRENT_VERSION) {
      // Handle migrations
      parsed.version = CURRENT_VERSION;
    }
    return parsed;
  } catch {
    return getDefaultState();
  }
}

export function setLocalState(state: LocalState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Asset operations
export function addAsset(asset: LocalAsset): void {
  const state = getLocalState();
  state.assets.push(asset);
  state.engagement.assetsAdded++;
  setLocalState(state);
}

export function updateAsset(id: string, updates: Partial<LocalAsset>): void {
  const state = getLocalState();
  const idx = state.assets.findIndex((a) => a.id === id);
  if (idx !== -1) {
    state.assets[idx] = { ...state.assets[idx], ...updates };
    setLocalState(state);
  }
}

export function deleteAsset(id: string): void {
  const state = getLocalState();
  state.assets = state.assets.filter((a) => a.id !== id);
  // Also remove from palettes
  state.palettes.forEach((p) => {
    p.assetIds = p.assetIds.filter((aid) => aid !== id);
  });
  // Remove associated receipts
  state.receipts = state.receipts.filter((r) => r.assetId !== id);
  setLocalState(state);
}

export function getAssets(): LocalAsset[] {
  return getLocalState().assets;
}

export function getAssetById(id: string): LocalAsset | undefined {
  return getLocalState().assets.find((a) => a.id === id);
}

// Palette operations
export function addPalette(palette: LocalPalette): void {
  const state = getLocalState();
  state.palettes.push(palette);
  state.engagement.palettesCreated++;
  setLocalState(state);
}

export function updatePalette(id: string, updates: Partial<LocalPalette>): void {
  const state = getLocalState();
  const idx = state.palettes.findIndex((p) => p.id === id);
  if (idx !== -1) {
    state.palettes[idx] = { ...state.palettes[idx], ...updates };
    setLocalState(state);
  }
}

export function deletePalette(id: string): void {
  const state = getLocalState();
  state.palettes = state.palettes.filter((p) => p.id !== id);
  setLocalState(state);
}

export function getPalettes(): LocalPalette[] {
  return getLocalState().palettes;
}

export function getPaletteById(id: string): LocalPalette | undefined {
  return getLocalState().palettes.find((p) => p.id === id);
}

export function addAssetToPalette(paletteId: string, assetId: string): void {
  const state = getLocalState();
  const palette = state.palettes.find((p) => p.id === paletteId);
  if (palette && !palette.assetIds.includes(assetId)) {
    palette.assetIds.push(assetId);
    setLocalState(state);
  }
}

export function removeAssetFromPalette(paletteId: string, assetId: string): void {
  const state = getLocalState();
  const palette = state.palettes.find((p) => p.id === paletteId);
  if (palette) {
    palette.assetIds = palette.assetIds.filter((id) => id !== assetId);
    setLocalState(state);
  }
}

// Receipt operations
export function addReceipt(receipt: LocalReceipt): void {
  const state = getLocalState();
  state.receipts.push(receipt);
  setLocalState(state);
}

export function updateReceipt(id: string, updates: Partial<LocalReceipt>): void {
  const state = getLocalState();
  const idx = state.receipts.findIndex((r) => r.id === id);
  if (idx !== -1) {
    state.receipts[idx] = { ...state.receipts[idx], ...updates };
    setLocalState(state);
  }
}

export function deleteReceipt(id: string): void {
  const state = getLocalState();
  state.receipts = state.receipts.filter((r) => r.id !== id);
  setLocalState(state);
}

export function getReceipts(): LocalReceipt[] {
  return getLocalState().receipts;
}

export function getReceiptForAsset(assetId: string): LocalReceipt | undefined {
  return getLocalState().receipts.find((r) => r.assetId === assetId);
}

// Engagement tracking
export function recordSimilaritySearch(): void {
  const state = getLocalState();
  state.engagement.similaritySearchCount++;
  setLocalState(state);
}

export function markSignupPromptShown(): void {
  const state = getLocalState();
  state.engagement.signupPromptShown = true;
  setLocalState(state);
}

export function markSyncedToCloud(): void {
  const state = getLocalState();
  state.engagement.syncedToCloud = true;
  setLocalState(state);
}

export function shouldShowSignupPrompt(): boolean {
  const state = getLocalState();
  const { engagement, palettes } = state;

  // Don't show if already shown or synced
  if (engagement.signupPromptShown || engagement.syncedToCloud) return false;

  // Show if user has done meaningful engagement:
  // - Run similarity search AND added 1+ item to palette
  // - OR created a palette with 3+ items
  const hasSearchedAndPalette =
    engagement.similaritySearchCount >= 1 &&
    palettes.some((p) => p.assetIds.length >= 1);

  const hasFullPalette = palettes.some((p) => p.assetIds.length >= 3);

  return hasSearchedAndPalette || hasFullPalette;
}

// Export all data for migration
export function getExportPayload(): {
  assets: LocalAsset[];
  palettes: LocalPalette[];
  receipts: LocalReceipt[];
} {
  const state = getLocalState();
  return {
    assets: state.assets,
    palettes: state.palettes,
    receipts: state.receipts,
  };
}

// Clear all local data (after successful cloud sync)
export function clearLocalData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
