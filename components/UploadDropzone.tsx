'use client';

import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { storeAudioBlob } from '@/lib/storage/localAssets';
import {
  addAsset,
  LocalAsset,
} from '@/lib/storage/localState';
import {
  extractAudioFeatures,
  buildDescriptor,
  generateContentHash,
  fetchEmbedding,
  generateDeterministicEmbedding,
} from '@/lib/similarity/embedding';

interface UploadDropzoneProps {
  onUploadComplete?: (asset: LocalAsset) => void;
  maxFiles?: number;
}

export function UploadDropzone({
  onUploadComplete,
  maxFiles = 50,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const processFile = useCallback(
    async (file: File) => {
      setProgress(`Processing ${file.name}...`);

      // Generate content hash
      const contentHash = await generateContentHash(file);

      // Extract audio features
      const features = await extractAudioFeatures(file);

      // Build descriptor
      const descriptor = buildDescriptor(file.name, [], features);

      // Try to get embedding from API, fall back to deterministic
      let embedding = await fetchEmbedding(descriptor);
      if (!embedding) {
        embedding = generateDeterministicEmbedding(descriptor);
      }

      const asset: LocalAsset = {
        id: uuidv4(),
        title: file.name.replace(/\.[^.]+$/, ''),
        originalFilename: file.name,
        contentHash,
        durationMs: features.durationMs,
        rms: features.rms,
        spectralCentroid: features.spectralCentroid,
        descriptor,
        embedding,
        tags: [],
        createdAt: Date.now(),
      };

      // Store blob in IndexedDB
      await storeAudioBlob(asset.id, file);

      // Add metadata to localStorage
      addAsset(asset);

      onUploadComplete?.(asset);

      return asset;
    },
    [onUploadComplete]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const audioFiles = Array.from(files).filter((f) =>
        f.type.startsWith('audio/')
      );

      if (audioFiles.length === 0) {
        alert('Please upload audio files only (mp3, wav, etc.)');
        return;
      }

      const toProcess = audioFiles.slice(0, maxFiles);

      setIsProcessing(true);

      for (const file of toProcess) {
        try {
          await processFile(file);
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
        }
      }

      setIsProcessing(false);
      setProgress('');
    },
    [maxFiles, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
          : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept="audio/*"
        multiple
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      <div className="pointer-events-none">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          {isProcessing ? progress : 'Drop audio files here'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {isProcessing
            ? 'Please wait...'
            : 'or click to browse (mp3, wav, aiff, flac)'}
        </p>
      </div>
    </div>
  );
}
