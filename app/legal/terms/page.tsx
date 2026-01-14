import Link from 'next/link';

export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="text-gray-500">Last updated: January 2025</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Indie Sample Finder (&ldquo;the Service&rdquo;), you agree to be
            bound by these Terms of Service. If you do not agree, please do not use the
            Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Indie Sample Finder is a web application that helps producers and musicians
            organize audio samples, find similar sounds, and track licenses. The Service
            includes both free and paid features.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            You may use many features without creating an account. If you create an
            account, you are responsible for maintaining the security of your account
            credentials. You must provide accurate information when creating an account.
          </p>

          <h2>4. User Content</h2>
          <p>
            You retain ownership of any audio files or content you upload to the Service.
            By uploading content, you grant us a limited license to store and process that
            content solely for the purpose of providing the Service to you.
          </p>
          <p>
            You are responsible for ensuring you have the right to use any content you
            upload. Do not upload content that infringes on third-party rights.
          </p>

          <h2>5. License Tracking Disclaimer</h2>
          <p>
            The License Vault feature is provided as a convenience for tracking your own
            records. We do not verify the accuracy or validity of any license information
            you store. You are solely responsible for compliance with sample licensing
            terms.
          </p>

          <h2>6. Paid Subscriptions</h2>
          <p>
            Some features require a paid subscription. Subscriptions are billed monthly or
            annually as selected. You may cancel at any time, and cancellation takes
            effect at the end of the current billing period.
          </p>
          <p>
            We reserve the right to change pricing with 30 days notice. Price changes do
            not affect existing subscription periods.
          </p>

          <h2>7. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Upload malicious files or code</li>
            <li>Attempt to access other users&apos; data</li>
            <li>Interfere with the proper functioning of the Service</li>
            <li>Resell or redistribute the Service without permission</li>
          </ul>

          <h2>8. Data and Privacy</h2>
          <p>
            Your use of the Service is also governed by our{' '}
            <Link href="/legal/privacy">Privacy Policy</Link>. Local data is stored on
            your device; cloud data is stored on our servers when you sign in.
          </p>

          <h2>9. Service Availability</h2>
          <p>
            We strive to maintain reliable service but do not guarantee uninterrupted
            availability. The Service is provided &ldquo;as is&rdquo; without warranties of any
            kind.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages arising from
            your use of the Service.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of significant
            changes. Continued use of the Service after changes constitutes acceptance of
            the new Terms.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your access to the Service at any time for
            violation of these Terms. You may terminate your account at any time by
            contacting us.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms, please contact us through the app or service
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
