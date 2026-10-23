export type SizeBand = 'small' | 'medium' | 'large' | 'giant';

export type CoatLength = 'short' | 'medium' | 'long' | 'wire' | 'hairless' | 'unknown';

export interface ImageAttribution {
  author: string;
  license: string;
  license_url: string;
  source: string;
  source_url: string;
}

export interface BreedImage {
  id: string;
  url: string;
  thumb: string;
  medium: string;
  large: string;
  attribution: ImageAttribution;
}

export interface BreedTraits {
  energy: number;
  barking: number;
  drooling: number;
  grooming: number;
  shedding: number;
  trainability: number;
  good_with_dogs: number;
  exercise_minutes: number;
  apartment_friendly: number;
  good_with_children: number;
  good_with_strangers: number;
  temperament: string[];
}

export interface BreedOrigin {
  era?: string;
  region?: string;
  country?: string;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface BreedSource {
  url: string;
  title: string;
}

export interface BreedCoat {
  type?: string;
  colors?: string[];
  length?: string;
}

export interface Breed {
  id: string;
  name: string;
  description: string;
  life: NumericRange;
  maleWeight: NumericRange;
  femaleWeight: NumericRange;
  maleHeight: NumericRange;
  femaleHeight: NumericRange;
  hypoallergenic: boolean;
  origin: BreedOrigin;
  coat: BreedCoat;
  traits: BreedTraits;
  otherNames: string[];
  recognizedBy: string[];
  sources: BreedSource[];
  images: BreedImage[];
  groupId: string | null;
  groupName: string;
  sizeBand: SizeBand;
}

export interface BreedGroup {
  id: string;
  name: string;
  breedIds: string[];
}

export interface SyncMetadata {
  lastSyncedAt: number | null;
  totalRecords: number;
  isPartial: boolean;
  lastError: string | null;
}

export interface FilterState {
  searchQuery: string;
  selectedGroupIds: string[];
  selectedSizeBands: SizeBand[];
  selectedCoatLengths: string[];
  hypoallergenicOnly: boolean | null;
  minGoodWithChildren: number;
  minGoodWithDogs: number;
  minGoodWithStrangers: number;
}

export interface ApiBreedAttributes {
  name: string;
  description?: string;
  life?: NumericRange;
  male_weight?: NumericRange;
  female_weight?: NumericRange;
  hypoallergenic?: boolean;
  male_height?: NumericRange;
  female_height?: NumericRange;
  origin?: BreedOrigin;
  coat?: {
    type?: string;
    colors?: string[];
    length?: string;
  };
  traits?: Partial<BreedTraits>;
  other_names?: string[];
  recognized_by?: string[];
  sources?: BreedSource[];
  images?: BreedImage[];
}

export interface ApiBreedResource {
  id: string;
  type: string;
  attributes: ApiBreedAttributes;
  relationships?: {
    group?: {
      data?: {
        id: string;
        type: string;
      } | null;
    };
  };
}

export interface ApiGroupResource {
  id: string;
  type: string;
  attributes: {
    name: string;
  };
  relationships?: {
    breeds?: {
      data?: Array<{ id: string; type: string }>;
    };
  };
}

export interface ApiPaginationMeta {
  pagination: {
    current: number;
    next?: number;
    last: number;
    records: number;
  };
}

export interface ApiPaginatedResponse<T> {
  data: T[];
  meta: ApiPaginationMeta;
  links?: Record<string, string>;
}

export interface ApiSingleResponse<T> {
  data: T;
  links?: Record<string, string>;
}
