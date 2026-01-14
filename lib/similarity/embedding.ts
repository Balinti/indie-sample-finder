// Embedding and descriptor generation

export interface AudioFeatures {
  durationMs: number;
  rms: number;
  spectralCentroid?: number;
}

// Build a descriptor string from audio metadata and features
export function buildDescriptor(
  filename: string,
  tags: string[],
  features: AudioFeatures
): string {
  const parts: string[] = [];

  // Filename without extension
  const name = filename.replace(/\.[^.]+$/, '').toLowerCase();
  parts.push(name);

  // Tags
  if (tags.length > 0) {
    parts.push(tags.join(' '));
  }

  // Duration category
  if (features.durationMs < 500) {
    parts.push('very-short one-shot');
  } else if (features.durationMs < 2000) {
    parts.push('short one-shot');
  } else if (features.durationMs < 8000) {
    parts.push('medium loop');
  } else {
    parts.push('long loop');
  }

  // RMS level (loudness)
  if (features.rms < 0.1) {
    parts.push('quiet soft');
  } else if (features.rms < 0.3) {
    parts.push('medium volume');
  } else {
    parts.push('loud punchy');
  }

  // Spectral centroid (brightness)
  if (features.spectralCentroid !== undefined) {
    if (features.spectralCentroid < 1000) {
      parts.push('dark bass low');
    } else if (features.spectralCentroid < 3000) {
      parts.push('mid-range warm');
    } else {
      parts.push('bright crisp high');
    }
  }

  return parts.join(' ');
}

// Extract audio features using WebAudio API
export async function extractAudioFeatures(blob: Blob): Promise<AudioFeatures> {
  if (typeof window === 'undefined') {
    return { durationMs: 0, rms: 0 };
  }

  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const durationMs = Math.round(audioBuffer.duration * 1000);

    // Calculate RMS
    const channelData = audioBuffer.getChannelData(0);
    let sumSquares = 0;
    for (let i = 0; i < channelData.length; i++) {
      sumSquares += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSquares / channelData.length);

    // Calculate spectral centroid (simplified)
    // Using FFT to get frequency spectrum
    const fftSize = 2048;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyser);

    const frequencyData = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(frequencyData);

    // Approximate spectral centroid
    let numerator = 0;
    let denominator = 0;
    const nyquist = audioContext.sampleRate / 2;

    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      const frequency = (i / frequencyData.length) * nyquist;
      numerator += magnitude * frequency;
      denominator += magnitude;
    }

    const spectralCentroid = denominator > 0 ? numerator / denominator : 2000;

    await audioContext.close();

    return { durationMs, rms, spectralCentroid };
  } catch (error) {
    console.error('Error extracting audio features:', error);
    return { durationMs: 0, rms: 0 };
  }
}

// Generate content hash from file
export async function generateContentHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fetch embedding from API
export async function fetchEmbedding(descriptor: string): Promise<number[] | null> {
  try {
    const response = await fetch('/api/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descriptor }),
    });

    const data = await response.json();

    if (data.disabled) {
      return null;
    }

    return data.embedding || null;
  } catch (error) {
    console.error('Error fetching embedding:', error);
    return null;
  }
}

// Generate deterministic embedding from descriptor (fallback)
export function generateDeterministicEmbedding(descriptor: string): number[] {
  // Simple hash-based pseudo-random vector
  const embedding: number[] = [];
  const seed = descriptor.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < 1536; i++) {
    // Using a simple PRNG based on seed and index
    const val = Math.sin(seed * (i + 1)) * 10000;
    embedding.push(val - Math.floor(val));
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
  return embedding.map((v) => v / magnitude);
}
