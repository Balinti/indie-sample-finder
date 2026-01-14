'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  shouldShowSignupPrompt,
  markSignupPromptShown,
} from '@/lib/storage/localState';
import { isSupabaseAvailable } from '@/lib/supabase/client';

export function SoftSignupPrompt() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPrompt = () => {
      if (!isSupabaseAvailable()) return;
      if (shouldShowSignupPrompt()) {
        setIsVisible(true);
      }
    };

    // Check on mount and periodically
    checkPrompt();
    const interval = setInterval(checkPrompt, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    markSignupPromptShown();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="pr-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
          Save your progress
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create a free account to keep your library, palettes, and license info safe.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/auth"
          className="flex-1 py-2 px-4 bg-indigo-600 text-white text-center text-sm font-medium rounded hover:bg-indigo-700"
        >
          Create free account
        </Link>
        <button
          onClick={handleDismiss}
          className="py-2 px-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
