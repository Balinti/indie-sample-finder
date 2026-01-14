'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getAssets,
  deleteAsset,
  updateAsset,
  LocalAsset,
} from '@/lib/storage/localState';
import { deleteAudioBlob, getAudioBlob } from '@/lib/storage/localAssets';

interface LibraryListProps {
  refreshTrigger?: number;
  onSelectAsset?: (asset: LocalAsset) => void;
  selectedAssetId?: string | null;
  onAddToPalette?: (asset: LocalAsset) => void;
}

export function LibraryList({
  refreshTrigger,
  onSelectAsset,
  selectedAssetId,
  onAddToPalette,
}: LibraryListProps) {
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState('');

  const loadAssets = useCallback(() => {
    setAssets(getAssets());
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets, refreshTrigger]);

  const handlePlay = async (asset: LocalAsset) => {
    // Stop current audio if playing
    if (audioElement) {
      audioElement.pause();
      URL.revokeObjectURL(audioElement.src);
    }

    if (playingId === asset.id) {
      setPlayingId(null);
      setAudioElement(null);
      return;
    }

    const blob = await getAudioBlob(asset.id);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
    };

    audio.play();
    setPlayingId(asset.id);
    setAudioElement(audio);
  };

  const handleDelete = async (asset: LocalAsset) => {
    if (!confirm(`Delete "${asset.title}"?`)) return;

    await deleteAudioBlob(asset.id);
    deleteAsset(asset.id);
    loadAssets();
  };

  const startEditing = (asset: LocalAsset) => {
    setEditingId(asset.id);
    setEditTitle(asset.title);
    setEditTags(asset.tags.join(', '));
  };

  const saveEditing = () => {
    if (!editingId) return;

    const tags = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateAsset(editingId, { title: editTitle, tags });
    setEditingId(null);
    loadAssets();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No audio files yet.</p>
        <p className="text-sm mt-1">Upload some samples to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
            selectedAssetId === asset.id
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
              : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
          }`}
          onClick={() => onSelectAsset?.(asset)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(asset);
            }}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {playingId === asset.id ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            {editingId === asset.id ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Title"
                />
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Tags (comma separated)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEditing}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium truncate">{asset.title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDuration(asset.durationMs)}</span>
                  {asset.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <span className="truncate">{asset.tags.join(', ')}</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {editingId !== asset.id && (
            <div className="flex gap-1">
              {onAddToPalette && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPalette(asset);
                  }}
                  className="p-2 text-gray-400 hover:text-indigo-600"
                  title="Add to palette"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(asset);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Edit"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(asset);
                }}
                className="p-2 text-gray-400 hover:text-red-600"
                title="Delete"
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
          )}
        </div>
      ))}
    </div>
  );
}
