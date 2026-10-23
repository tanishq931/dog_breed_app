import { fetchWithRetry } from './client';
import type {
  ApiBreedResource,
  ApiGroupResource,
  ApiPaginatedResponse,
  ApiSingleResponse,
  Breed,
  BreedGroup,
  BreedTraits,
} from '../types/breed';
import { deriveSizeBand } from '../utils/formatters';

const DEFAULT_BASE_URL = 'https://dogapi.dog/api/v2';
const PAGE_SIZE = 48;

export interface FetchBreedsResult {
  breeds: Breed[];
  isPartial: boolean;
  totalPages: number;
  totalRecords: number;
  failedPages: number[];
}

export function normalizeBreed(
  resource: ApiBreedResource,
  groupsMap: Map<string, string>,
): Breed {
  const attrs = resource.attributes;
  const groupId = resource.relationships?.group?.data?.id ?? null;
  const groupName = groupId ? groupsMap.get(groupId) ?? 'Unknown Group' : 'Unassigned';

  const defaultTraits: BreedTraits = {
    energy: attrs.traits?.energy ?? 3,
    barking: attrs.traits?.barking ?? 3,
    drooling: attrs.traits?.drooling ?? 1,
    grooming: attrs.traits?.grooming ?? 2,
    shedding: attrs.traits?.shedding ?? 2,
    trainability: attrs.traits?.trainability ?? 3,
    good_with_dogs: attrs.traits?.good_with_dogs ?? 3,
    exercise_minutes: attrs.traits?.exercise_minutes ?? 45,
    apartment_friendly: attrs.traits?.apartment_friendly ?? 3,
    good_with_children: attrs.traits?.good_with_children ?? 3,
    good_with_strangers: attrs.traits?.good_with_strangers ?? 3,
    temperament: attrs.traits?.temperament ?? [],
  };

  return {
    id: resource.id,
    name: attrs.name || 'Unnamed Breed',
    description: attrs.description || '',
    life: attrs.life || { min: 10, max: 14 },
    maleWeight: attrs.male_weight || { min: 15, max: 25 },
    femaleWeight: attrs.female_weight || { min: 12, max: 22 },
    maleHeight: attrs.male_height || { min: 30, max: 50 },
    femaleHeight: attrs.female_height || { min: 28, max: 48 },
    hypoallergenic: Boolean(attrs.hypoallergenic),
    origin: attrs.origin || {},
    coat: attrs.coat || {},
    traits: defaultTraits,
    otherNames: attrs.other_names || [],
    recognizedBy: attrs.recognized_by || [],
    sources: attrs.sources || [],
    images: attrs.images || [],
    groupId,
    groupName,
    sizeBand: deriveSizeBand(
      attrs.male_weight,
      attrs.female_weight,
      attrs.male_height,
    ),
  };
}

export async function fetchGroups(
  baseUrl = DEFAULT_BASE_URL,
): Promise<BreedGroup[]> {
  const url = `${baseUrl}/groups`;
  const response = await fetchWithRetry<ApiPaginatedResponse<ApiGroupResource>>(url, {
    retries: 3,
    timeoutMs: 12000,
  });

  return (response.data || []).map((item) => ({
    id: item.id,
    name: item.attributes.name,
    breedIds: (item.relationships?.breeds?.data || []).map((b) => b.id),
  }));
}

export async function fetchBreedsPage(
  pageNumber: number,
  pageSize = PAGE_SIZE,
  baseUrl = DEFAULT_BASE_URL,
): Promise<ApiPaginatedResponse<ApiBreedResource>> {
  const url = `${baseUrl}/breeds?page[number]=${pageNumber}&page[size]=${pageSize}`;
  return fetchWithRetry<ApiPaginatedResponse<ApiBreedResource>>(url, {
    retries: 3,
    timeoutMs: 15000,
  });
}

export async function fetchAllBreeds(
  groups: BreedGroup[],
  baseUrl = DEFAULT_BASE_URL,
): Promise<FetchBreedsResult> {
  const groupsMap = new Map<string, string>();
  for (const g of groups) {
    groupsMap.set(g.id, g.name);
  }

  // 1. Fetch initial page to discover total page count and total records
  const firstPage = await fetchBreedsPage(1, PAGE_SIZE, baseUrl);
  const totalPages = firstPage.meta.pagination.last || 6;
  const totalRecords = firstPage.meta.pagination.records || 283;

  const rawBreeds: ApiBreedResource[] = [...firstPage.data];
  const failedPages: number[] = [];

  // 2. Fetch remaining pages (pages 2 through totalPages)
  const remainingPageNumbers: number[] = [];
  for (let p = 2; p <= totalPages; p += 1) {
    remainingPageNumbers.push(p);
  }

  // Fetch in controlled concurrency batches of 2 to avoid network socket exhaustion
  const batchSize = 2;
  for (let i = 0; i < remainingPageNumbers.length; i += batchSize) {
    const chunk = remainingPageNumbers.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      chunk.map((pageNum) => fetchBreedsPage(pageNum, PAGE_SIZE, baseUrl)),
    );

    results.forEach((res, index) => {
      const pageNum = chunk[index];
      if (res.status === 'fulfilled') {
        rawBreeds.push(...res.value.data);
      } else {
        failedPages.push(pageNum);
      }
    });
  }

  // Deduplicate records by id
  const seenIds = new Set<string>();
  const normalizedBreeds: Breed[] = [];

  for (const item of rawBreeds) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      normalizedBreeds.push(normalizeBreed(item, groupsMap));
    }
  }

  return {
    breeds: normalizedBreeds,
    isPartial: failedPages.length > 0,
    totalPages,
    totalRecords,
    failedPages,
  };
}

export async function fetchBreedDetails(
  breedId: string,
  groupsMap: Map<string, string>,
  baseUrl = DEFAULT_BASE_URL,
): Promise<Breed> {
  const url = `${baseUrl}/breeds/${breedId}`;
  const response = await fetchWithRetry<ApiSingleResponse<ApiBreedResource>>(url, {
    retries: 2,
    timeoutMs: 10000,
  });

  return normalizeBreed(response.data, groupsMap);
}
