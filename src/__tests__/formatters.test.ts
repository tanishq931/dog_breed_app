import {
  calculateAverage,
  deriveSizeBand,
  formatFreshness,
  formatRange,
  formatTraitLabel,
} from '../utils/formatters';

describe('calculateAverage', () => {
  it('computes arithmetic mean of min and max', () => {
    expect(calculateAverage({ min: 10, max: 20 })).toBe(15);
  });

  it('handles single bounds gracefully', () => {
    expect(calculateAverage({ min: 10, max: undefined as unknown as number })).toBe(10);
    expect(calculateAverage({ min: undefined as unknown as number, max: 25 })).toBe(25);
  });

  it('returns null if range is undefined or invalid', () => {
    expect(calculateAverage(undefined)).toBeNull();
  });
});

describe('deriveSizeBand', () => {
  it('correctly maps weight in kg to size categories', () => {
    expect(deriveSizeBand({ min: 4, max: 8 })).toBe('small');
    expect(deriveSizeBand({ min: 12, max: 20 })).toBe('medium');
    expect(deriveSizeBand({ min: 28, max: 36 })).toBe('large');
    expect(deriveSizeBand({ min: 48, max: 65 })).toBe('giant');
  });

  it('falls back to female weight when male weight is missing', () => {
    expect(deriveSizeBand(undefined, { min: 6, max: 8 })).toBe('small');
  });

  it('falls back to height if weight is missing', () => {
    expect(deriveSizeBand(undefined, undefined, { min: 20, max: 25 })).toBe('small');
    expect(deriveSizeBand(undefined, undefined, { min: 35, max: 45 })).toBe('medium');
    expect(deriveSizeBand(undefined, undefined, { min: 55, max: 65 })).toBe('large');
    expect(deriveSizeBand(undefined, undefined, { min: 75, max: 85 })).toBe('giant');
  });
});

describe('formatRange', () => {
  it('formats range min to max', () => {
    expect(formatRange({ min: 10, max: 15 }, 'kg')).toBe('10 - 15 kg');
  });

  it('formats single equal bounds cleanly', () => {
    expect(formatRange({ min: 20, max: 20 }, 'cm')).toBe('20 cm');
  });

  it('handles partial or missing bounds', () => {
    expect(formatRange(undefined, 'kg')).toBe('Unknown');
  });
});

describe('formatFreshness', () => {
  it('returns "Never synced" for null timestamp', () => {
    expect(formatFreshness(null)).toBe('Never synced');
  });

  it('formats relative durations accurately', () => {
    const now = Date.now();
    expect(formatFreshness(now - 10 * 1000)).toBe('Just now');
    expect(formatFreshness(now - 5 * 60 * 1000)).toBe('5 minutes ago');
    expect(formatFreshness(now - 60 * 60 * 1000)).toBe('1 hour ago');
    expect(formatFreshness(now - 3 * 60 * 60 * 1000)).toBe('3 hours ago');
    expect(formatFreshness(now - 25 * 60 * 60 * 1000)).toBe('Yesterday');
  });
});

describe('formatTraitLabel', () => {
  it('converts underscore keys to human readable titles', () => {
    expect(formatTraitLabel('good_with_children')).toBe('Good with Children');
    expect(formatTraitLabel('exercise_minutes')).toBe('Daily Exercise');
    expect(formatTraitLabel('apartment_friendly')).toBe('Apartment Friendly');
  });
});
