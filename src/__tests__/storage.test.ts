import {
  clearAllLocalData,
  DEFAULT_SYNC_META,
  loadBreeds,
  loadGroups,
  loadSyncMeta,
  recordCachedImage,
  saveBreeds,
  saveGroups,
  saveSyncMeta,
} from '../db/storage';
import type { Breed, BreedGroup, SyncMetadata } from '../types/breed';

const sampleBreed: Breed = {
  id: 'b-100',
  name: 'Akita',
  description: 'Dignified and courageous.',
  life: { min: 10, max: 13 },
  maleWeight: { min: 38, max: 54 },
  femaleWeight: { min: 34, max: 50 },
  maleHeight: { min: 66, max: 71 },
  femaleHeight: { min: 61, max: 66 },
  hypoallergenic: false,
  origin: { country: 'Japan' },
  coat: { type: 'double', length: 'medium' },
  traits: {
    energy: 3,
    barking: 2,
    drooling: 2,
    grooming: 3,
    shedding: 4,
    trainability: 3,
    good_with_dogs: 1,
    exercise_minutes: 45,
    apartment_friendly: 2,
    good_with_children: 2,
    good_with_strangers: 1,
    temperament: ['dignified', 'courageous', 'loyal'],
  },
  otherNames: ['Akita Inu'],
  recognizedBy: ['AKC', 'FCI'],
  sources: [],
  images: [],
  groupId: 'working-group',
  groupName: 'Working Group',
  sizeBand: 'giant',
};

const sampleGroup: BreedGroup = {
  id: 'working-group',
  name: 'Working Group',
  breedIds: ['b-100'],
};

describe('storage module', () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  it('saves and reloads normalized breeds', async () => {
    await saveBreeds([sampleBreed]);
    const loaded = await loadBreeds();
    expect(loaded).toHaveLength(1);
    expect(loaded?.[0].id).toBe('b-100');
    expect(loaded?.[0].name).toBe('Akita');
  });

  it('saves and reloads groups', async () => {
    await saveGroups([sampleGroup]);
    const loaded = await loadGroups();
    expect(loaded).toHaveLength(1);
    expect(loaded?.[0].name).toBe('Working Group');
  });

  it('saves and loads sync metadata', async () => {
    const meta: SyncMetadata = {
      lastSyncedAt: 1729000000000,
      totalRecords: 283,
      isPartial: false,
      lastError: null,
    };
    await saveSyncMeta(meta);
    const loaded = await loadSyncMeta();
    expect(loaded.lastSyncedAt).toBe(1729000000000);
    expect(loaded.totalRecords).toBe(283);
    expect(loaded.isPartial).toBe(false);
  });

  it('returns default sync metadata when empty', async () => {
    const loaded = await loadSyncMeta();
    expect(loaded).toEqual(DEFAULT_SYNC_META);
  });

  it('tracks cached images without throwing', async () => {
    await expect(
      recordCachedImage('https://images.dogapi.dog/sample.jpg', 'thumb', 40000),
    ).resolves.not.toThrow();
  });
});
