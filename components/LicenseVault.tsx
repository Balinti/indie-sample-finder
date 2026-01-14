'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getAssets,
  getReceipts,
  getReceiptForAsset,
  addReceipt,
  updateReceipt,
  deleteReceipt,
  LocalAsset,
  LocalReceipt,
} from '@/lib/storage/localState';

interface LicenseVaultProps {
  isSignedIn?: boolean;
}

export function LicenseVault({ isSignedIn = false }: LicenseVaultProps) {
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [receipts, setReceipts] = useState<LocalReceipt[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<LocalReceipt | null>(null);

  // Form state
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [licenseFlags, setLicenseFlags] = useState({
    royaltyFree: false,
    commercialUse: true,
    attributionRequired: false,
    exclusive: false,
  });

  const loadData = useCallback(() => {
    setAssets(getAssets());
    setReceipts(getReceipts());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectAsset = (asset: LocalAsset) => {
    setSelectedAssetId(asset.id);

    const receipt = getReceiptForAsset(asset.id);
    if (receipt) {
      setEditingReceipt(receipt);
      setSourceUrl(receipt.sourceUrl);
      setNotes(receipt.notes);
      setLicenseFlags(receipt.licenseFlags as typeof licenseFlags);
    } else {
      setEditingReceipt(null);
      setSourceUrl('');
      setNotes('');
      setLicenseFlags({
        royaltyFree: false,
        commercialUse: true,
        attributionRequired: false,
        exclusive: false,
      });
    }
  };

  const handleSave = () => {
    if (!selectedAssetId) return;

    if (editingReceipt) {
      updateReceipt(editingReceipt.id, {
        sourceUrl,
        notes,
        licenseFlags,
      });
    } else {
      const receipt: LocalReceipt = {
        id: uuidv4(),
        assetId: selectedAssetId,
        sourceUrl,
        notes,
        licenseFlags,
        createdAt: Date.now(),
      };
      addReceipt(receipt);
    }

    loadData();
    setSelectedAssetId(null);
    setEditingReceipt(null);
  };

  const handleDelete = () => {
    if (!editingReceipt) return;
    if (!confirm('Delete this license info?')) return;

    deleteReceipt(editingReceipt.id);
    loadData();
    setSelectedAssetId(null);
    setEditingReceipt(null);
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h3 className="font-medium mb-2">License Vault</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track licenses, receipts, and usage rights for your samples.
          {!isSignedIn && (
            <span className="block mt-1 text-yellow-600 dark:text-yellow-400">
              Note: File uploads available for signed-in users. You can add URLs and notes now.
            </span>
          )}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Asset list */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-500">Your Samples</h4>
          {assets.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Upload samples to add license info
            </p>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {assets.map((asset) => {
                const hasReceipt = receipts.some((r) => r.assetId === asset.id);
                return (
                  <button
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      selectedAssetId === asset.id
                        ? 'bg-indigo-100 dark:bg-indigo-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hasReceipt && (
                        <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full" />
                      )}
                      <span className="truncate">{asset.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* License form */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          {selectedAsset ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Editing license for:</p>
                <p className="font-medium">{selectedAsset.title}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Source URL / Purchase Link
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="License details, order ID, etc."
                  rows={3}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">License Flags</label>
                <div className="space-y-2">
                  {[
                    { key: 'royaltyFree', label: 'Royalty Free' },
                    { key: 'commercialUse', label: 'Commercial Use Allowed' },
                    { key: 'attributionRequired', label: 'Attribution Required' },
                    { key: 'exclusive', label: 'Exclusive License' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={licenseFlags[key as keyof typeof licenseFlags]}
                        onChange={(e) =>
                          setLicenseFlags({
                            ...licenseFlags,
                            [key]: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {editingReceipt ? 'Update' : 'Save'}
                </button>
                {editingReceipt && (
                  <button
                    onClick={handleDelete}
                    className="py-2 px-4 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAssetId(null);
                    setEditingReceipt(null);
                  }}
                  className="py-2 px-4 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-10 w-10 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">Select a sample to add license info</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
