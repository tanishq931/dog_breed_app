import { useBreedStore } from '../store/breedStore';
import { clearAllLocalData, saveBreeds, saveSyncMeta } from '../db/storage';
import type { Breed } from '../types/breed';

const mockTestBreed: Breed = {
  id: 'b-999',
  name: 'Labrador Retriever',
  description: 'Even-tempered and gentle.',
  life: { min: 10, max: 12 },
  maleWeight: { min: 29, max: 36 },
  femaleWeight: { min: 25, max: 32 },
  maleHeight: { min: 57, max: 62 },
  femaleHeight: { min: 55, max: 60 },
  hypoallergenic: false,
  origin: { country: 'Canada', region: 'Newfoundland' },
  coat: { type: 'double', length: 'short' },
  traits: {
    energy: 5,
    barking: 2,
    drooling: 1,
    grooming: 2,
    shedding: 4,
    trainability: 5,
    good_with_dogs: 5,
    exercise_minutes: 60,
    apartment_friendly: 2,
    good_with_children: 5,
    good_with_strangers: 5,
    temperament: ['outgoing', 'even-tempered', 'gentle'],
  },
  otherNames: ['Lab'],
  recognizedBy: ['AKC'],
  sources: [],
  images: [],
  groupId: 'group-sporting',
  groupName: 'Sporting Group',
  sizeBand: 'large',
};

describe('useBreedStore', () => {
  beforeEach(async () => {
    await clearAllLocalData();
    useBreedStore.setState({
      breedsById: {},
      breedIds: [],
      groupsById: {},
      groupIds: [],
      isInitialized: false,
      isSyncing: false,
      isOffline: false,
      lastSyncedAt: null,
      syncError: null,
      isPartial: false,
    });
  });

  it('hydrates immediately from local storage cache on initialize()', async () => {
    const recentTime = Date.now();
    await saveBreeds([mockTestBreed]);
    await saveSyncMeta({
      lastSyncedAt: recentTime,
      totalRecords: 1,
      isPartial: false,
      lastError: null,
    });

    const store = useBreedStore.getState();
    await store.initialize();

    const updated = useBreedStore.getState();
    expect(updated.isInitialized).toBe(true);
    expect(updated.breedIds).toContain('b-999');
    expect(updated.breedsById['b-999'].name).toBe('Labrador Retriever');
    expect(updated.lastSyncedAt).toBe(recentTime);
  });

  it('updates filters and resets properly', () => {
    const store = useBreedStore.getState();
    store.setFilter('searchQuery', 'poodle');
    expect(useBreedStore.getState().filters.searchQuery).toBe('poodle');

    store.setFilter('selectedSizeBands', ['small']);
    expect(useBreedStore.getState().filters.selectedSizeBands).toEqual(['small']);

    store.resetFilters();
    expect(useBreedStore.getState().filters.searchQuery).toBe('');
    expect(useBreedStore.getState().filters.selectedSizeBands).toEqual([]);
  });

  it('dismisses sync error banner', () => {
    useBreedStore.setState({ syncError: 'Network error occurred' });
    expect(useBreedStore.getState().syncError).toBe('Network error occurred');

    useBreedStore.getState().dismissSyncError();
    expect(useBreedStore.getState().syncError).toBeNull();
  });
});
