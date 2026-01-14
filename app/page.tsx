import Link from 'next/link';
import { TryNowButton } from '@/components/TryNowButton';
import { Pricing } from '@/components/Pricing';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-indigo-600"
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
              <span className="font-semibold text-lg">Indie Sample Finder</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                Sign in
              </Link>
              <TryNowButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            AI Sample Librarian
            <br />
            <span className="text-indigo-600">+ License Vault</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Organize your samples with AI-powered similarity search. Create sound
            palettes, track licenses, and export your collections. No signup required
            to get started.
          </p>
          <div className="flex justify-center gap-4">
            <TryNowButton />
            <a
              href="#features"
              className="inline-flex items-center justify-center px-6 py-4 text-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-sm text-gray-500">
                indie-sample-finder.vercel.app
              </span>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Library Panel</span>
                </div>
                <div className="flex-1 h-40 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Similarity Search</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                  <span className="text-indigo-500">Drop audio files here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to manage your samples
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                ),
                title: 'Similarity Search',
                description:
                  'Find similar sounds in your library using AI-powered audio analysis. Upload a sample and discover related sounds instantly.',
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                ),
                title: 'Sound Palettes',
                description:
                  'Create themed collections of sounds. Perfect for organizing samples by project, mood, or genre. Export as ZIP anytime.',
              },
              {
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                ),
                title: 'License Vault',
                description:
                  'Never lose track of your sample licenses again. Attach receipts, URLs, and notes to each sound in your library.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Get started in seconds
          </h2>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Upload your samples',
                description:
                  'Drag and drop your audio files. We support mp3, wav, aiff, flac, and more.',
              },
              {
                step: '2',
                title: 'Search and organize',
                description:
                  'Find similar sounds, add tags, and create palettes to organize your library.',
              },
              {
                step: '3',
                title: 'Track and export',
                description:
                  'Attach license info and export your palettes as ZIP files anytime.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <Pricing />

      {/* CTA */}
      <section className="py-20 px-4 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to organize your samples?
          </h2>
          <p className="text-indigo-200 mb-8">
            No signup required. Start using the sample finder right now.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-indigo-600"
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
            <span className="font-medium">Indie Sample Finder</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/legal/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
