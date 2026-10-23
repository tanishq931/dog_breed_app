import { create } from 'zustand';
import { fetchAllBreeds, fetchBreedDetails, fetchGroups } from '../api/dogApi';
import {
  loadBreeds,
  loadGroups,
  loadSyncMeta,
  saveBreeds,
  saveGroups,
  saveSyncMeta,
} from '../db/storage';
import type { Breed, BreedGroup, FilterState } from '../types/breed';
import { INITIAL_FILTERS } from '../utils/filters';

interface BreedStoreState {
  breedsById: Record<string, Breed>;
  breedIds: string[];
  groupsById: Record<string, BreedGroup>;
  groupIds: string[];
  filters: FilterState;
  isInitialized: boolean;
  isSyncing: boolean;
  isOffline: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
  isPartial: boolean;

  // Actions
  initialize: () => Promise<void>;
  sync: (options?: { force?: boolean }) => Promise<void>;
  enrichBreed: (breedId: string) => Promise<void>;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  setFilters: (nextFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setOfflineStatus: (isOffline: boolean) => void;
  dismissSyncError: () => void;
}

export const useBreedStore = create<BreedStoreState>((set, get) => ({
  breedsById: {},
  breedIds: [],
  groupsById: {},
  groupIds: [],
  filters: INITIAL_FILTERS,
  isInitialized: false,
  isSyncing: false,
  isOffline: false,
  lastSyncedAt: null,
  syncError: null,
  isPartial: false,

  initialize: async () => {
    // 1. Instantly hydrate from local storage to achieve <3s to interactive
    const [cachedBreeds, cachedGroups, meta] = await Promise.all([
      loadBreeds(),
      loadGroups(),
      loadSyncMeta(),
    ]);

    const breedsById: Record<string, Breed> = {};
    const breedIds: string[] = [];
    if (cachedBreeds && cachedBreeds.length > 0) {
      for (const breed of cachedBreeds) {
        breedsById[breed.id] = breed;
        breedIds.push(breed.id);
      }
    }

    const groupsById: Record<string, BreedGroup> = {};
    const groupIds: string[] = [];
    if (cachedGroups && cachedGroups.length > 0) {
      for (const group of cachedGroups) {
        groupsById[group.id] = group;
        groupIds.push(group.id);
      }
    }

    set({
      breedsById,
      breedIds,
      groupsById,
      groupIds,
      lastSyncedAt: meta.lastSyncedAt,
      isPartial: meta.isPartial,
      syncError: meta.lastError,
      isInitialized: true,
    });

    // 2. If no cached data or cache is older than 60 minutes, trigger background sync
    const CACHE_TTL_MS = 60 * 60 * 1000;
    const isStale =
      !meta.lastSyncedAt || Date.now() - meta.lastSyncedAt > CACHE_TTL_MS;

    if ((breedIds.length === 0 || isStale) && !get().isOffline) {
      get().sync();
    }
  },

  sync: async (_options) => {
    const { isSyncing } = get();
    if (isSyncing) return;

    set({ isSyncing: true, syncError: null });

    try {
      // 1. Fetch breed groups
      const groups = await fetchGroups();
      const groupsById: Record<string, BreedGroup> = {};
      const groupIds: string[] = [];
      for (const group of groups) {
        groupsById[group.id] = group;
        groupIds.push(group.id);
      }

      // 2. Fetch all paginated breeds with retry and merge
      const result = await fetchAllBreeds(groups);

      // Merge newly fetched breeds with existing breeds in case of partial response
      const existingMap = { ...get().breedsById };
      for (const breed of result.breeds) {
        existingMap[breed.id] = breed;
      }

      const mergedBreeds = Object.values(existingMap);
      const mergedBreedIds = mergedBreeds.map((b) => b.id);

      const now = Date.now();
      const errorMsg = result.isPartial
        ? `Partial sync: ${result.breeds.length} of ${result.totalRecords} breeds fetched.`
        : null;

      // 3. Persist merged data
      await Promise.all([
        saveBreeds(mergedBreeds),
        saveGroups(groups),
        saveSyncMeta({
          lastSyncedAt: now,
          totalRecords: mergedBreeds.length,
          isPartial: result.isPartial,
          lastError: errorMsg,
        }),
      ]);

      set({
        breedsById: existingMap,
        breedIds: mergedBreedIds,
        groupsById,
        groupIds,
        isSyncing: false,
        lastSyncedAt: now,
        isPartial: result.isPartial,
        syncError: errorMsg,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to synchronize with Dog API';

      // Keep existing cached data, record error banner
      set({
        isSyncing: false,
        syncError: message,
      });

      // Update metadata with failure details
      const meta = await loadSyncMeta();
      await saveSyncMeta({
        ...meta,
        lastError: message,
      });
    }
  },

  enrichBreed: async (breedId: string) => {
    const { groupsById, breedsById } = get();
    const groupsMap = new Map<string, string>();
    for (const [id, g] of Object.entries(groupsById)) {
      groupsMap.set(id, g.name);
    }

    try {
      const enriched = await fetchBreedDetails(breedId, groupsMap);
      const updated = {
        ...breedsById,
        [breedId]: enriched,
      };
      set({ breedsById: updated });
      await saveBreeds(Object.values(updated));
    } catch (error) {
      console.warn(`Failed to refresh breed details for ${breedId}:`, error);
    }
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },

  setFilters: (nextFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...nextFilters,
      },
    }));
  },

  resetFilters: () => {
    set({ filters: INITIAL_FILTERS });
  },

  setOfflineStatus: (isOffline: boolean) => {
    const wasOffline = get().isOffline;
    set({ isOffline });

    // When connection restores and data is stale or previously failed, trigger background sync
    if (wasOffline && !isOffline) {
      const { lastSyncedAt, isPartial, syncError } = get();
      const CACHE_TTL_MS = 60 * 60 * 1000;
      const isStale =
        !lastSyncedAt || Date.now() - lastSyncedAt > CACHE_TTL_MS;

      if (isStale || isPartial || syncError) {
        get().sync();
      }
    }
  },

  dismissSyncError: () => {
    set({ syncError: null });
  },
}));
