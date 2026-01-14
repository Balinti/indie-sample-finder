import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

// Generate deterministic embedding from descriptor (fallback)
function generateDeterministicEmbedding(descriptor: string): number[] {
  const embedding: number[] = [];
  const seed = descriptor.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 1536; i++) {
    const val = Math.sin(seed * (i + 1)) * 10000;
    embedding.push(val - Math.floor(val));
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => v / magnitude);
}

export async function POST(request: NextRequest) {
  try {
    const { descriptor } = await request.json();

    if (!descriptor || typeof descriptor !== 'string') {
      return NextResponse.json(
        { error: 'Descriptor string is required' },
        { status: 400 }
      );
    }

    // If OpenAI is configured, use it for embeddings
    if (env.isOpenAIConfigured) {
      try {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: descriptor,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            embedding: data.data[0].embedding,
            source: 'openai',
          });
        }
      } catch (openaiError) {
        console.error('OpenAI embedding failed:', openaiError);
        // Fall through to deterministic fallback
      }
    }

    // Fallback to deterministic embedding
    const embedding = generateDeterministicEmbedding(descriptor);
    return NextResponse.json({
      embedding,
      source: 'deterministic',
    });
  } catch (error) {
    console.error('Embeddings API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}
