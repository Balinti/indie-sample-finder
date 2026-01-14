'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  getPalettes,
  addPalette,
  updatePalette,
  deletePalette,
  addAssetToPalette,
  removeAssetFromPalette,
  getAssetById,
  LocalPalette,
  LocalAsset,
} from '@/lib/storage/localState';
import { getAudioBlob } from '@/lib/storage/localAssets';

interface PaletteEditorProps {
  onAssetAddedToPalette?: () => void;
  pendingAsset?: LocalAsset | null;
  onPendingAssetHandled?: () => void;
}

export function PaletteEditor({
  onAssetAddedToPalette,
  pendingAsset,
  onPendingAssetHandled,
}: PaletteEditorProps) {
  const [palettes, setPalettes] = useState<LocalPalette[]>([]);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const loadPalettes = useCallback(() => {
    setPalettes(getPalettes());
  }, []);

  useEffect(() => {
    loadPalettes();
  }, [loadPalettes]);

  // Handle pending asset from other components
  useEffect(() => {
    if (pendingAsset && selectedPaletteId) {
      addAssetToPalette(selectedPaletteId, pendingAsset.id);
      loadPalettes();
      onAssetAddedToPalette?.();
      onPendingAssetHandled?.();
    }
  }, [
    pendingAsset,
    selectedPaletteId,
    loadPalettes,
    onAssetAddedToPalette,
    onPendingAssetHandled,
  ]);

  const handleCreatePalette = () => {
    if (!newPaletteName.trim()) return;

    const palette: LocalPalette = {
      id: uuidv4(),
      name: newPaletteName.trim(),
      notes: '',
      assetIds: [],
      createdAt: Date.now(),
    };

    addPalette(palette);
    setSelectedPaletteId(palette.id);
    setNewPaletteName('');
    setIsCreating(false);
    loadPalettes();
  };

  const handleDeletePalette = (id: string) => {
    if (!confirm('Delete this palette?')) return;
    deletePalette(id);
    if (selectedPaletteId === id) {
      setSelectedPaletteId(null);
    }
    loadPalettes();
  };

  const handleRemoveAsset = (paletteId: string, assetId: string) => {
    removeAssetFromPalette(paletteId, assetId);
    loadPalettes();
  };

  const handleExportPalette = async (palette: LocalPalette) => {
    setIsExporting(true);

    try {
      const zip = new JSZip();

      // Create manifest
      const manifest = {
        name: palette.name,
        notes: palette.notes,
        createdAt: palette.createdAt,
        exportedAt: Date.now(),
        assets: [] as Array<{
          title: string;
          filename: string;
          duration: number;
          tags: string[];
        }>,
      };

      // Add audio files
      for (const assetId of palette.assetIds) {
        const asset = getAssetById(assetId);
        if (!asset) continue;

        const blob = await getAudioBlob(assetId);
        if (blob) {
          zip.file(`audio/${asset.originalFilename}`, blob);
        }

        manifest.assets.push({
          title: asset.title,
          filename: asset.originalFilename,
          duration: asset.durationMs,
          tags: asset.tags,
        });
      }

      // Add manifest
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${palette.name.replace(/\s+/g, '-').toLowerCase()}-palette.zip`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export palette');
    }

    setIsExporting(false);
  };

  const selectedPalette = palettes.find((p) => p.id === selectedPaletteId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Sound Palettes
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          New Palette
        </button>
      </div>

      {isCreating && (
        <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <input
            type="text"
            value={newPaletteName}
            onChange={(e) => setNewPaletteName(e.target.value)}
            placeholder="Palette name..."
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 mb-3"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePalette()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreatePalette}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewPaletteName('');
              }}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {palettes.length === 0 && !isCreating && (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <p>No palettes yet.</p>
          <p className="text-sm mt-1">Create one to organize your sounds!</p>
        </div>
      )}

      <div className="grid gap-2">
        {palettes.map((palette) => (
          <div
            key={palette.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedPaletteId === palette.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
            onClick={() => setSelectedPaletteId(palette.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{palette.name}</p>
                <p className="text-sm text-gray-500">
                  {palette.assetIds.length} sound
                  {palette.assetIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportPalette(palette);
                  }}
                  disabled={isExporting || palette.assetIds.length === 0}
                  className="p-2 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
                  title="Export as ZIP"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePalette(palette.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete palette"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPalette && selectedPalette.assetIds.length > 0 && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
          <h4 className="font-medium mb-3">
            Sounds in &quot;{selectedPalette.name}&quot;
          </h4>
          <div className="space-y-2">
            {selectedPalette.assetIds.map((assetId) => {
              const asset = getAssetById(assetId);
              if (!asset) return null;

              return (
                <div
                  key={assetId}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded"
                >
                  <span className="truncate">{asset.title}</span>
                  <button
                    onClick={() => handleRemoveAsset(selectedPalette.id, assetId)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pendingAsset && !selectedPaletteId && palettes.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Select a palette to add &quot;{pendingAsset.title}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
