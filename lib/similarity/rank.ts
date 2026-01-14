// Similarity ranking utilities

import { LocalAsset } from '../storage/localState';

// Cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// Text token overlap similarity (fallback)
export function tokenSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.toLowerCase().split(/\s+/));
  const tokensB = new Set(b.toLowerCase().split(/\s+/));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);

  return intersection.size / union.size;
}

// Duration proximity (0-1 score)
export function durationSimilarity(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;

  const ratio = Math.min(a, b) / Math.max(a, b);
  return ratio;
}

// Combined similarity score
export function combinedSimilarity(
  targetAsset: LocalAsset,
  candidateAsset: LocalAsset,
  useEmbeddings: boolean
): number {
  let score = 0;
  let weights = 0;

  // Embedding similarity (if available)
  if (
    useEmbeddings &&
    targetAsset.embedding &&
    candidateAsset.embedding
  ) {
    const embSim = cosineSimilarity(targetAsset.embedding, candidateAsset.embedding);
    score += embSim * 0.6;
    weights += 0.6;
  }

  // Text similarity (descriptor + tags)
  const textA =
    targetAsset.descriptor + ' ' + targetAsset.tags.join(' ');
  const textB =
    candidateAsset.descriptor + ' ' + candidateAsset.tags.join(' ');
  const textSim = tokenSimilarity(textA, textB);
  score += textSim * 0.3;
  weights += 0.3;

  // Duration similarity
  const durSim = durationSimilarity(
    targetAsset.durationMs,
    candidateAsset.durationMs
  );
  score += durSim * 0.1;
  weights += 0.1;

  return weights > 0 ? score / weights : 0;
}

export interface SimilarityResult {
  asset: LocalAsset;
  score: number;
}

// Find similar assets
export function findSimilarAssets(
  targetAsset: LocalAsset,
  allAssets: LocalAsset[],
  limit: number = 10,
  useEmbeddings: boolean = true
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  for (const candidate of allAssets) {
    // Skip the target itself
    if (candidate.id === targetAsset.id) continue;

    const score = combinedSimilarity(targetAsset, candidate, useEmbeddings);
    results.push({ asset: candidate, score });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
