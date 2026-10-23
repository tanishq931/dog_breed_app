import type { NumericRange, SizeBand } from '../types/breed';

export function calculateAverage(range?: NumericRange): number | null {
  if (!range) return null;
  const { min, max } = range;
  if (typeof min === 'number' && typeof max === 'number') {
    return (min + max) / 2;
  }
  if (typeof min === 'number') return min;
  if (typeof max === 'number') return max;
  return null;
}

export function deriveSizeBand(
  maleWeight?: NumericRange,
  femaleWeight?: NumericRange,
  maleHeight?: NumericRange,
): SizeBand {
  const avgMale = calculateAverage(maleWeight);
  const avgFemale = calculateAverage(femaleWeight);
  const weight = avgMale ?? avgFemale;

  if (weight !== null) {
    if (weight < 10) return 'small';
    if (weight < 25) return 'medium';
    if (weight < 45) return 'large';
    return 'giant';
  }

  const height = calculateAverage(maleHeight);
  if (height !== null) {
    if (height < 30) return 'small';
    if (height < 50) return 'medium';
    if (height < 70) return 'large';
    return 'giant';
  }

  return 'medium';
}

export function formatRange(
  range?: NumericRange,
  unit = '',
  emptyText = 'Unknown',
): string {
  if (!range) return emptyText;
  const { min, max } = range;
  if (min != null && max != null) {
    return min === max ? `${min} ${unit}`.trim() : `${min} - ${max} ${unit}`.trim();
  }
  if (min != null) return `From ${min} ${unit}`.trim();
  if (max != null) return `Up to ${max} ${unit}`.trim();
  return emptyText;
}

export function formatFreshness(timestamp: number | null): string {
  if (!timestamp) return 'Never synced';
  const elapsedMs = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(elapsedMs / 1000);
  if (seconds < 45) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return '1 minute ago';
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function formatTraitLabel(traitKey: string): string {
  const customLabels: Record<string, string> = {
    energy: 'Energy Level',
    barking: 'Barking Frequency',
    drooling: 'Drooling Tendency',
    grooming: 'Grooming Demands',
    shedding: 'Shedding Level',
    trainability: 'Trainability',
    good_with_dogs: 'Good with Dogs',
    exercise_minutes: 'Daily Exercise',
    apartment_friendly: 'Apartment Friendly',
    good_with_children: 'Good with Children',
    good_with_strangers: 'Good with Strangers',
  };
  return customLabels[traitKey] || traitKey.replace(/_/g, ' ');
}
