'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { UploadDropzone } from '@/components/UploadDropzone';
import { LibraryList } from '@/components/LibraryList';
import { SimilarityPanel } from '@/components/SimilarityPanel';
import { PaletteEditor } from '@/components/PaletteEditor';
import { LicenseVault } from '@/components/LicenseVault';
import { SoftSignupPrompt } from '@/components/SoftSignupPrompt';
import { LocalAsset } from '@/lib/storage/localState';

type Tab = 'library' | 'similarity' | 'palettes' | 'vault';

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<LocalAsset | null>(null);
  const [pendingPaletteAsset, setPendingPaletteAsset] = useState<LocalAsset | null>(
    null
  );

  const handleUploadComplete = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleSelectAsset = useCallback((asset: LocalAsset) => {
    setSelectedAsset(asset);
  }, []);

  const handleAddToPalette = useCallback((asset: LocalAsset) => {
    setPendingPaletteAsset(asset);
    setActiveTab('palettes');
  }, []);

  const handlePendingAssetHandled = useCallback(() => {
    setPendingPaletteAsset(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTab('similarity');
      } else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setActiveTab('palettes');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs: { id: Tab; label: string; shortcut?: string }[] = [
    { id: 'library', label: 'Library' },
    { id: 'similarity', label: 'Similarity', shortcut: '/' },
    { id: 'palettes', label: 'Palettes', shortcut: 'n' },
    { id: 'vault', label: 'License Vault' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link href="/" className="flex items-center gap-2">
              <svg
                className="w-7 h-7 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              <span className="font-semibold">Indie Sample Finder</span>
            </Link>
            <Link
              href="/auth"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">
                    {tab.shortcut}
                  </kbd>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main panel */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            {activeTab === 'library' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Your Library</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload and manage your audio samples. All files are stored locally
                    in your browser.
                  </p>
                </div>

                <UploadDropzone onUploadComplete={handleUploadComplete} />

                <div>
                  <h2 className="text-lg font-semibold mb-3">Samples</h2>
                  <LibraryList
                    refreshTrigger={refreshTrigger}
                    onSelectAsset={handleSelectAsset}
                    selectedAssetId={selectedAsset?.id}
                    onAddToPalette={handleAddToPalette}
                  />
                </div>
              </div>
            )}

            {activeTab === 'similarity' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Similarity Search</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Find sounds similar to a selected sample using AI-powered audio
                    analysis.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Select a sample</h2>
                    <LibraryList
                      refreshTrigger={refreshTrigger}
                      onSelectAsset={handleSelectAsset}
                      selectedAssetId={selectedAsset?.id}
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Similar sounds</h2>
                    <SimilarityPanel
                      selectedAsset={selectedAsset}
                      onAddToPalette={handleAddToPalette}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'palettes' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">Sound Palettes</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Create and organize collections of sounds. Export as ZIP to share
                    or backup.
                  </p>
                </div>

                <PaletteEditor
                  pendingAsset={pendingPaletteAsset}
                  onPendingAssetHandled={handlePendingAssetHandled}
                />
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">License Vault</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track licenses and receipts for your samples. Never lose track of
                    usage rights.
                  </p>
                </div>

                <LicenseVault />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Soft signup prompt */}
      <SoftSignupPrompt />
    </div>
  );
}
