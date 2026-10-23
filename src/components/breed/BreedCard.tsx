import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CachedImage } from '../common/CachedImage';
import { useAppTheme } from '../../theme/useTheme';
import type { Breed } from '../../types/breed';

interface BreedCardProps {
  breed: Breed;
  onPress: (breed: Breed) => void;
}

function BreedCardComponent({ breed, onPress }: BreedCardProps) {
  const { colors } = useAppTheme();
  const primaryImage = breed.images[0];
  const thumbUri = primaryImage?.thumb || primaryImage?.url;
  const temperaments = breed.traits.temperament.slice(0, 2);

  const sizeLabels: Record<string, string> = {
    small: 'Small (<10kg)',
    medium: 'Medium (10-25kg)',
    large: 'Large (25-45kg)',
    giant: 'Giant (>45kg)',
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
      onPress={() => onPress(breed)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${breed.name}, ${breed.groupName}, ${breed.sizeBand} size. Tap to view breed details.`}
    >
      <CachedImage
        uri={thumbUri}
        variant="thumb"
        fallbackText={breed.name}
        style={styles.thumbnail}
        accessibilityLabel={`${breed.name} thumbnail photo`}
      />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {breed.name}
          </Text>
          {breed.hypoallergenic && (
            <View
              style={[
                styles.hypoBadge,
                { backgroundColor: colors.accentLight },
              ]}
            >
              <Text style={[styles.hypoText, { color: colors.accent }]}>
                Hypoallergenic
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[styles.subtitle, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {breed.groupName}
        </Text>

        <View style={styles.tagsRow}>
          <View
            style={[
              styles.sizeBadge,
              { backgroundColor: colors.surfaceHover },
            ]}
          >
            <Text style={[styles.sizeText, { color: colors.textSecondary }]}>
              {sizeLabels[breed.sizeBand] || breed.sizeBand}
            </Text>
          </View>

          {temperaments.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tagBadge,
                { backgroundColor: colors.surfaceHover },
              ]}
            >
              <Text
                style={[styles.tagText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

export const BreedCard = React.memo(BreedCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 6,
  },
  hypoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  hypoText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  sizeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sizeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
    paddingHorizontal: 4,
  },
});
