import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Breed, BreedGroup, SyncMetadata } from '../types/breed';

const STORAGE_KEYS = {
  BREEDS: '@dog_breeds:v1:breeds',
  GROUPS: '@dog_breeds:v1:groups',
  SYNC_META: '@dog_breeds:v1:sync_meta',
  IMAGE_CACHE_META: '@dog_breeds:v1:image_cache_meta',
} as const;

export interface ImageCacheEntry {
  url: string;
  variant: 'thumb' | 'medium' | 'large';
  cachedAt: number;
  lastAccessedAt: number;
  sizeBytes?: number;
}

export interface ImageCacheRegistry {
  maxEntries: number;
  entries: Record<string, ImageCacheEntry>;
}

export const DEFAULT_SYNC_META: SyncMetadata = {
  lastSyncedAt: null,
  totalRecords: 0,
  isPartial: false,
  lastError: null,
};

export async function saveBreeds(breeds: Breed[]): Promise<void> {
  try {
    const json = JSON.stringify(breeds);
    await AsyncStorage.setItem(STORAGE_KEYS.BREEDS, json);
  } catch (error) {
    console.warn('Failed to save breeds to storage:', error);
  }
}

export async function loadBreeds(): Promise<Breed[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.BREEDS);
    if (!raw) return null;
    return JSON.parse(raw) as Breed[];
  } catch (error) {
    console.warn('Failed to load breeds from storage:', error);
    return null;
  }
}

export async function saveGroups(groups: BreedGroup[]): Promise<void> {
  try {
    const json = JSON.stringify(groups);
    await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, json);
  } catch (error) {
    console.warn('Failed to save groups to storage:', error);
  }
}

export async function loadGroups(): Promise<BreedGroup[] | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
    if (!raw) return null;
    return JSON.parse(raw) as BreedGroup[];
  } catch (error) {
    console.warn('Failed to load groups from storage:', error);
    return null;
  }
}

export async function saveSyncMeta(meta: SyncMetadata): Promise<void> {
  try {
    const json = JSON.stringify(meta);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_META, json);
  } catch (error) {
    console.warn('Failed to save sync metadata:', error);
  }
}

export async function loadSyncMeta(): Promise<SyncMetadata> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_META);
    if (!raw) return DEFAULT_SYNC_META;
    return JSON.parse(raw) as SyncMetadata;
  } catch (error) {
    console.warn('Failed to load sync metadata:', error);
    return DEFAULT_SYNC_META;
  }
}

const MAX_IMAGE_REGISTRY_ENTRIES = 120;

export async function recordCachedImage(
  url: string,
  variant: 'thumb' | 'medium' | 'large',
  estimatedBytes = 35000,
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.IMAGE_CACHE_META);
    const registry: ImageCacheRegistry = raw
      ? JSON.parse(raw)
      : { maxEntries: MAX_IMAGE_REGISTRY_ENTRIES, entries: {} };

    registry.entries[url] = {
      url,
      variant,
      cachedAt: registry.entries[url]?.cachedAt || Date.now(),
      lastAccessedAt: Date.now(),
      sizeBytes: estimatedBytes,
    };

    // LRU eviction if exceeding max entries
    const keys = Object.keys(registry.entries);
    if (keys.length > registry.maxEntries) {
      const sorted = keys.sort(
        (a, b) =>
          registry.entries[a].lastAccessedAt - registry.entries[b].lastAccessedAt,
      );
      const toRemove = sorted.slice(0, keys.length - registry.maxEntries);
      for (const k of toRemove) {
        delete registry.entries[k];
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.IMAGE_CACHE_META,
      JSON.stringify(registry),
    );
  } catch {
    // Non-critical image registry update failure
  }
}

export async function clearAllLocalData(): Promise<void> {
  try {
    const keys = [
      STORAGE_KEYS.BREEDS,
      STORAGE_KEYS.GROUPS,
      STORAGE_KEYS.SYNC_META,
      STORAGE_KEYS.IMAGE_CACHE_META,
    ];
    await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
  } catch (error) {
    console.warn('Failed to clear storage:', error);
  }
}
