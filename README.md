# Indie Sample Finder

AI Sample Librarian + License Vault for producers and musicians. Organize your samples with AI-powered similarity search, create sound palettes, and track licenses.

## Features

- **Similarity Search**: Find similar sounds in your library using AI-powered audio analysis
- **Sound Palettes**: Create themed collections and export as ZIP
- **License Vault**: Track licenses, receipts, and usage rights
- **Local-First**: Works without signup, data stored in browser
- **Cloud Sync**: Optional account to sync across devices

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app.

## Environment Variables

Create a `.env.local` file with the following variables:

### Required for cloud features (optional for local use)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Price IDs (optional - hides upgrade UI if missing)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID=price_xxx

# App URL
NEXT_PUBLIC_APP_URL=https://indie-sample-finder.vercel.app
```

### Optional (enhanced features)

```env
# OpenAI (for better similarity search)
OPENAI_API_KEY=your_openai_api_key
```

## Environment Variable Summary

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | No | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | No | Supabase service role key |
| `STRIPE_SECRET_KEY` | Server | No | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client | No | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Server | No | Stripe webhook signature secret |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | Client | No | Stripe Pro tier price ID |
| `NEXT_PUBLIC_STRIPE_PRO_PLUS_PRICE_ID` | Client | No | Stripe Pro+ tier price ID |
| `NEXT_PUBLIC_APP_URL` | Client | No | Production app URL |
| `OPENAI_API_KEY` | Server | No | OpenAI API key for embeddings |

## Feature Gating

The app gracefully handles missing configuration:

- **No Supabase**: Auth disabled, local-only mode
- **No Stripe**: Upgrade UI hidden, free features work
- **No OpenAI**: Uses deterministic embeddings (text similarity fallback)

## Database Setup

Run the Supabase migrations in order:

1. `supabase/migrations/001_schema.sql` - Creates tables
2. `supabase/migrations/002_rls.sql` - Enables Row Level Security

### Storage Bucket

Create a `receipts` bucket in Supabase Storage (private) for receipt file uploads.

## Pricing Tiers

| Feature | Free | Pro ($9/mo) | Pro+ ($19/mo) |
|---------|------|-------------|---------------|
| Samples | 50 | 500 | Unlimited |
| Palettes | 5 | 50 | Unlimited |
| Similarity results | 5 | 20 | 50 |
| PDF export | - | Yes | Yes |
| Receipt uploads | - | Yes | Yes |

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage)
- Stripe (Subscriptions)
- IndexedDB (Local audio storage)
- OpenAI (Optional embeddings)

## Project Structure

```
app/
├── page.tsx              # Landing page
├── app/page.tsx          # Core app experience
├── auth/page.tsx         # Sign in/up
├── account/page.tsx      # Account management
├── legal/
│   ├── privacy/page.tsx
│   └── terms/page.tsx
└── api/
    ├── embeddings/route.ts
    ├── stripe/
    │   ├── checkout/route.ts
    │   ├── portal/route.ts
    │   └── webhook/route.ts
    └── sync/migrate/route.ts

components/
├── TryNowButton.tsx
├── UploadDropzone.tsx
├── LibraryList.tsx
├── SimilarityPanel.tsx
├── PaletteEditor.tsx
├── LicenseVault.tsx
├── SoftSignupPrompt.tsx
└── Pricing.tsx

lib/
├── env.ts
├── stripe.ts
├── supabase/
│   ├── client.ts
│   └── server.ts
├── storage/
│   ├── localAssets.ts
│   └── localState.ts
└── similarity/
    ├── embedding.ts
    └── rank.ts

supabase/migrations/
├── 001_schema.sql
└── 002_rls.sql
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

Configure environment variables in Vercel dashboard or via CLI.

## License

MIT
