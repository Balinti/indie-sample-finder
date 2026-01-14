'use client';

import Link from 'next/link';

export function TryNowButton() {
  return (
    <Link
      href="/app"
      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
    >
      Try it now
      <svg
        className="ml-2 w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </Link>
  );
}
