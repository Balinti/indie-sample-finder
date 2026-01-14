'use client';

import { useState, useCallback } from 'react';
import { LocalAsset, getAssets, recordSimilaritySearch } from '@/lib/storage/localState';
import { findSimilarAssets, SimilarityResult } from '@/lib/similarity/rank';
import { getAudioBlob } from '@/lib/storage/localAssets';

interface SimilarityPanelProps {
  selectedAsset: LocalAsset | null;
  onAddToPalette?: (asset: LocalAsset) => void;
}

export function SimilarityPanel({ selectedAsset, onAddToPalette }: SimilarityPanelProps) {
  const [results, setResults] = useState<SimilarityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleFindSimilar = useCallback(async () => {
    if (!selectedAsset) return;

    setIsSearching(true);

    const allAssets = getAssets();
    const useEmbeddings = allAssets.some((a) => a.embedding !== null);
    const similar = findSimilarAssets(selectedAsset, allAssets, 10, useEmbeddings);

    setResults(similar);
    setHasSearched(true);
    setIsSearching(false);

    // Record engagement
    recordSimilaritySearch();
  }, [selectedAsset]);

  const handlePlay = async (asset: LocalAsset) => {
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

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100) + '%';
  };

  if (!selectedAsset) {
    return (
      <div className="text-center py-12 text-gray-500">
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p>Select a sample from your library</p>
        <p className="text-sm mt-1">to find similar sounds</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-sm text-gray-500 mb-1">Finding similar to:</p>
        <p className="font-medium">{selectedAsset.title}</p>
        <p className="text-sm text-gray-500">
          {formatDuration(selectedAsset.durationMs)}
          {selectedAsset.tags.length > 0 && ` · ${selectedAsset.tags.join(', ')}`}
        </p>
      </div>

      <button
        onClick={handleFindSimilar}
        disabled={isSearching}
        className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSearching ? 'Searching...' : 'Find Similar Sounds'}
      </button>

      {hasSearched && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No similar sounds found.</p>
          <p className="text-sm mt-1">Try uploading more samples!</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-2">
            Found {results.length} similar sound{results.length !== 1 ? 's' : ''}:
          </p>
          {results.map(({ asset, score }) => (
            <div
              key={asset.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
            >
              <button
                onClick={() => handlePlay(asset)}
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
                <p className="font-medium truncate">{asset.title}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDuration(asset.durationMs)}</span>
                  <span>·</span>
                  <span className="text-indigo-600 font-medium">
                    {formatScore(score)} match
                  </span>
                </div>
              </div>

              {onAddToPalette && (
                <button
                  onClick={() => onAddToPalette(asset)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
