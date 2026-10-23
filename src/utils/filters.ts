import type { Breed, FilterState } from '../types/breed';

export interface BreedSection {
  title: string;
  groupId: string | null;
  data: Breed[];
}

export function matchesCoatFilter(breed: Breed, selectedCoats: string[]): boolean {
  if (selectedCoats.length === 0) return true;
  const coatLength = breed.coat.length?.toLowerCase();
  const coatType = breed.coat.type?.toLowerCase();

  return selectedCoats.some((filter) => {
    const target = filter.toLowerCase();
    return coatLength === target || coatType === target;
  });
}

export function filterBreed(breed: Breed, filters: FilterState): boolean {
  const query = filters.searchQuery.trim().toLowerCase();
  if (query.length > 0) {
    const matchesName = breed.name.toLowerCase().includes(query);
    const matchesOtherNames = breed.otherNames.some((alt) =>
      alt.toLowerCase().includes(query),
    );
    if (!matchesName && !matchesOtherNames) {
      return false;
    }
  }

  if (filters.selectedGroupIds.length > 0) {
    if (!breed.groupId || !filters.selectedGroupIds.includes(breed.groupId)) {
      return false;
    }
  }

  if (filters.selectedSizeBands.length > 0) {
    if (!filters.selectedSizeBands.includes(breed.sizeBand)) {
      return false;
    }
  }

  if (!matchesCoatFilter(breed, filters.selectedCoatLengths)) {
    return false;
  }

  if (filters.hypoallergenicOnly === true && !breed.hypoallergenic) {
    return false;
  }

  if (
    filters.minGoodWithChildren > 0 &&
    (breed.traits.good_with_children || 0) < filters.minGoodWithChildren
  ) {
    return false;
  }

  if (
    filters.minGoodWithDogs > 0 &&
    (breed.traits.good_with_dogs || 0) < filters.minGoodWithDogs
  ) {
    return false;
  }

  if (
    filters.minGoodWithStrangers > 0 &&
    (breed.traits.good_with_strangers || 0) < filters.minGoodWithStrangers
  ) {
    return false;
  }

  return true;
}

export function groupBreedsByGroup(breeds: Breed[]): BreedSection[] {
  const groupsMap = new Map<string, { title: string; groupId: string | null; data: Breed[] }>();

  for (const breed of breeds) {
    const key = breed.groupId || 'unassigned';
    const groupName = breed.groupName || 'Other Breeds';

    let bucket = groupsMap.get(key);
    if (!bucket) {
      bucket = {
        title: groupName,
        groupId: breed.groupId,
        data: [],
      };
      groupsMap.set(key, bucket);
    }
    bucket.data.push(breed);
  }

  const sections = Array.from(groupsMap.values());

  sections.sort((a, b) => a.title.localeCompare(b.title));
  for (const section of sections) {
    section.data.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sections;
}

export const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  selectedGroupIds: [],
  selectedSizeBands: [],
  selectedCoatLengths: [],
  hypoallergenicOnly: null,
  minGoodWithChildren: 0,
  minGoodWithDogs: 0,
  minGoodWithStrangers: 0,
};

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.selectedGroupIds.length > 0 ||
    filters.selectedSizeBands.length > 0 ||
    filters.selectedCoatLengths.length > 0 ||
    filters.hypoallergenicOnly !== null ||
    filters.minGoodWithChildren > 0 ||
    filters.minGoodWithDogs > 0 ||
    filters.minGoodWithStrangers > 0
  );
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  if (filters.selectedGroupIds.length > 0) count += filters.selectedGroupIds.length;
  if (filters.selectedSizeBands.length > 0) count += filters.selectedSizeBands.length;
  if (filters.selectedCoatLengths.length > 0) count += filters.selectedCoatLengths.length;
  if (filters.hypoallergenicOnly !== null) count += 1;
  if (filters.minGoodWithChildren > 0) count += 1;
  if (filters.minGoodWithDogs > 0) count += 1;
  if (filters.minGoodWithStrangers > 0) count += 1;
  return count;
}
