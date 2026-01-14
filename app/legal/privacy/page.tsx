import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
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
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto prose dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-gray-500">Last updated: January 2025</p>

          <h2>Overview</h2>
          <p>
            Indie Sample Finder (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your
            privacy. This policy explains how we handle your information.
          </p>

          <h2>Information We Collect</h2>
          <h3>Local Storage</h3>
          <p>
            When you use the app without signing in, all your data (audio files,
            metadata, palettes, license information) is stored locally in your browser
            using IndexedDB and localStorage. We do not have access to this data.
          </p>

          <h3>Account Information</h3>
          <p>
            If you create an account, we collect your email address and store it
            securely in our database (hosted on Supabase). We use this to authenticate
            you and communicate important account information.
          </p>

          <h3>Synced Data</h3>
          <p>
            When you sign in, you may choose to sync your local data to our cloud
            storage. This includes sample metadata, palettes, and license information.
            Audio files may be uploaded if you use the receipt upload feature (Pro
            tier).
          </p>

          <h3>Payment Information</h3>
          <p>
            Payment processing is handled by Stripe. We do not store your credit card
            information. Stripe may store payment details according to their privacy
            policy.
          </p>

          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain the service</li>
            <li>To authenticate your account</li>
            <li>To process payments for premium features</li>
            <li>To communicate important updates about the service</li>
          </ul>

          <h2>Data Retention</h2>
          <p>
            Local data remains on your device until you clear it. Cloud-synced data is
            retained as long as your account is active. You can delete your account and
            all associated data at any time by contacting us.
          </p>

          <h2>Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase</strong> - Database and authentication
            </li>
            <li>
              <strong>Stripe</strong> - Payment processing
            </li>
            <li>
              <strong>Vercel</strong> - Hosting
            </li>
            <li>
              <strong>OpenAI</strong> - Text embeddings for similarity search (optional)
            </li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your data</li>
            <li>Export your data</li>
            <li>Delete your data</li>
            <li>Opt out of data collection (by using the app without signing in)</li>
          </ul>

          <h2>Contact</h2>
          <p>
            For privacy-related inquiries, please contact us through the app or service
            channels.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto flex gap-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/legal/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/legal/terms" className="hover:underline">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
