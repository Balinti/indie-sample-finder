// IndexedDB storage for audio blobs
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AssetDB extends DBSchema {
  audioBlobs: {
    key: string;
    value: {
      id: string;
      blob: Blob;
      createdAt: number;
    };
  };
}

const DB_NAME = 'indie-sample-finder';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<AssetDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB<AssetDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function storeAudioBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB();
  if (!db) return;

  await db.put('audioBlobs', {
    id,
    blob,
    createdAt: Date.now(),
  });
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  const db = await getDB();
  if (!db) return null;

  const record = await db.get('audioBlobs', id);
  return record?.blob || null;
}

export async function deleteAudioBlob(id: string): Promise<void> {
  const db = await getDB();
  if (!db) return;

  await db.delete('audioBlobs', id);
}

export async function getAllAudioBlobs(): Promise<{ id: string; blob: Blob }[]> {
  const db = await getDB();
  if (!db) return [];

  const records = await db.getAll('audioBlobs');
  return records.map((r) => ({ id: r.id, blob: r.blob }));
}

export async function clearAllAudioBlobs(): Promise<void> {
  const db = await getDB();
  if (!db) return;

  await db.clear('audioBlobs');
}
