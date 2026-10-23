import type { Breed } from '../types/breed';
import {
  filterBreed,
  groupBreedsByGroup,
  INITIAL_FILTERS,
  matchesCoatFilter,
} from '../utils/filters';

const mockBreed = (overrides: Partial<Breed> = {}): Breed => ({
  id: 'breed-1',
  name: 'Golden Retriever',
  description: 'Friendly and intelligent retriever.',
  life: { min: 10, max: 12 },
  maleWeight: { min: 29, max: 34 },
  femaleWeight: { min: 25, max: 32 },
  maleHeight: { min: 56, max: 61 },
  femaleHeight: { min: 51, max: 56 },
  hypoallergenic: false,
  origin: { country: 'United Kingdom', region: 'Scotland' },
  coat: { type: 'double', length: 'long' },
  traits: {
    energy: 4,
    barking: 2,
    drooling: 1,
    grooming: 3,
    shedding: 4,
    trainability: 5,
    good_with_dogs: 5,
    exercise_minutes: 60,
    apartment_friendly: 2,
    good_with_children: 5,
    good_with_strangers: 4,
    temperament: ['friendly', 'intelligent', 'devoted'],
  },
  otherNames: ['Golden', 'Yellow Retriever'],
  recognizedBy: ['AKC', 'UKC'],
  sources: [],
  images: [],
  groupId: 'group-sporting',
  groupName: 'Sporting Group',
  sizeBand: 'large',
  ...overrides,
});

describe('filterBreed', () => {
  it('matches all breeds with initial blank filters', () => {
    const breed = mockBreed();
    expect(filterBreed(breed, INITIAL_FILTERS)).toBe(true);
  });

  it('searches by breed name case-insensitively', () => {
    const breed = mockBreed({ name: 'Border Collie' });
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, searchQuery: 'collie' }),
    ).toBe(true);
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, searchQuery: 'poodle' }),
    ).toBe(false);
  });

  it('searches by alternative names (otherNames)', () => {
    const breed = mockBreed({ otherNames: ['Shepherd Dog', 'German Shepherd'] });
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, searchQuery: 'shepherd' }),
    ).toBe(true);
  });

  it('filters by breed group ID', () => {
    const breed = mockBreed({ groupId: 'group-herding' });
    expect(
      filterBreed(breed, {
        ...INITIAL_FILTERS,
        selectedGroupIds: ['group-herding', 'group-toy'],
      }),
    ).toBe(true);
    expect(
      filterBreed(breed, {
        ...INITIAL_FILTERS,
        selectedGroupIds: ['group-hound'],
      }),
    ).toBe(false);
  });

  it('filters by size category', () => {
    const breed = mockBreed({ sizeBand: 'giant' });
    expect(
      filterBreed(breed, {
        ...INITIAL_FILTERS,
        selectedSizeBands: ['giant', 'large'],
      }),
    ).toBe(true);
    expect(
      filterBreed(breed, {
        ...INITIAL_FILTERS,
        selectedSizeBands: ['small'],
      }),
    ).toBe(false);
  });

  it('filters by hypoallergenic flag', () => {
    const nonHypo = mockBreed({ hypoallergenic: false });
    const hypo = mockBreed({ hypoallergenic: true });

    expect(
      filterBreed(nonHypo, { ...INITIAL_FILTERS, hypoallergenicOnly: true }),
    ).toBe(false);
    expect(
      filterBreed(hypo, { ...INITIAL_FILTERS, hypoallergenicOnly: true }),
    ).toBe(true);
  });

  it('filters by trait thresholds', () => {
    const breed = mockBreed({
      traits: {
        ...mockBreed().traits,
        good_with_children: 4,
        good_with_dogs: 3,
        good_with_strangers: 2,
      },
    });

    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithChildren: 4 }),
    ).toBe(true);
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithChildren: 5 }),
    ).toBe(false);

    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithDogs: 3 }),
    ).toBe(true);
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithDogs: 4 }),
    ).toBe(false);

    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithStrangers: 2 }),
    ).toBe(true);
    expect(
      filterBreed(breed, { ...INITIAL_FILTERS, minGoodWithStrangers: 3 }),
    ).toBe(false);
  });
});

describe('matchesCoatFilter', () => {
  it('matches length or type accurately', () => {
    const wireBreed = mockBreed({ coat: { type: 'wire', length: 'short' } });
    expect(matchesCoatFilter(wireBreed, ['wire'])).toBe(true);
    expect(matchesCoatFilter(wireBreed, ['short'])).toBe(true);
    expect(matchesCoatFilter(wireBreed, ['long'])).toBe(false);
  });
});

describe('groupBreedsByGroup', () => {
  it('groups and sorts breeds alphabetically by group name and breed name', () => {
    const b1 = mockBreed({
      id: '1',
      name: 'Beagle',
      groupName: 'Hound Group',
      groupId: 'hound',
    });
    const b2 = mockBreed({
      id: '2',
      name: 'Airedale Terrier',
      groupName: 'Terrier Group',
      groupId: 'terrier',
    });
    const b3 = mockBreed({
      id: '3',
      name: 'Bloodhound',
      groupName: 'Hound Group',
      groupId: 'hound',
    });

    const sections = groupBreedsByGroup([b1, b2, b3]);

    expect(sections.length).toBe(2);
    expect(sections[0].title).toBe('Hound Group');
    expect(sections[0].data.map((b) => b.name)).toEqual(['Beagle', 'Bloodhound']);
    expect(sections[1].title).toBe('Terrier Group');
    expect(sections[1].data.map((b) => b.name)).toEqual(['Airedale Terrier']);
  });
});
