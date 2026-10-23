import { normalizeBreed } from '../api/dogApi';
import type { ApiBreedResource } from '../types/breed';

describe('dogApi', () => {
  it('normalizes raw JSON:API breed resource into typed domain Breed', () => {
    const raw: ApiBreedResource = {
      id: 'breed-xyz',
      type: 'breed',
      attributes: {
        name: 'Beagle',
        description: 'Small, compact hound dog.',
        life: { min: 12, max: 15 },
        male_weight: { min: 10, max: 11 },
        female_weight: { min: 9, max: 10 },
        hypoallergenic: false,
        traits: {
          energy: 4,
          barking: 5,
          temperament: ['friendly', 'curious', 'merry'],
        },
        other_names: ['English Beagle'],
        recognized_by: ['AKC', 'FCI'],
        sources: [{ title: 'AKC Standard', url: 'https://akc.org/beagle' }],
        images: [
          {
            id: 'img-1',
            url: 'https://images.dogapi.dog/full.jpg',
            thumb: 'https://images.dogapi.dog/thumb.jpg',
            medium: 'https://images.dogapi.dog/medium.jpg',
            large: 'https://images.dogapi.dog/large.jpg',
            attribution: {
              author: 'Photographer',
              license: 'CC BY 2.0',
              license_url: 'https://creativecommons.org',
              source: 'Wikimedia',
              source_url: 'https://commons.wikimedia.org',
            },
          },
        ],
      },
      relationships: {
        group: {
          data: {
            id: 'group-hound',
            type: 'group',
          },
        },
      },
    };

    const groupsMap = new Map([['group-hound', 'Hound Group']]);
    const normalized = normalizeBreed(raw, groupsMap);

    expect(normalized.id).toBe('breed-xyz');
    expect(normalized.name).toBe('Beagle');
    expect(normalized.groupName).toBe('Hound Group');
    expect(normalized.sizeBand).toBe('medium');
    expect(normalized.traits.barking).toBe(5);
    expect(normalized.traits.energy).toBe(4);
    expect(normalized.traits.temperament).toEqual(['friendly', 'curious', 'merry']);
    expect(normalized.images).toHaveLength(1);
    expect(normalized.images[0].attribution.author).toBe('Photographer');
  });

  it('assigns defaults when optional attributes are missing', () => {
    const minimal: ApiBreedResource = {
      id: 'breed-min',
      type: 'breed',
      attributes: {
        name: 'Mystery Dog',
      },
    };

    const groupsMap = new Map<string, string>();
    const normalized = normalizeBreed(minimal, groupsMap);

    expect(normalized.id).toBe('breed-min');
    expect(normalized.name).toBe('Mystery Dog');
    expect(normalized.groupName).toBe('Unassigned');
    expect(normalized.hypoallergenic).toBe(false);
    expect(normalized.traits.energy).toBe(3);
    expect(normalized.otherNames).toEqual([]);
    expect(normalized.images).toEqual([]);
  });
});
