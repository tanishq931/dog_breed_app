import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CachedImage } from '../common/CachedImage';
import { useAppTheme } from '../../theme/useTheme';
import type { Breed } from '../../types/breed';
import { formatRange } from '../../utils/formatters';

interface OverviewTabProps {
  breed: Breed;
}

export function OverviewTab({ breed }: OverviewTabProps) {
  const { colors } = useAppTheme();
  const primaryImage = breed.images[0];
  const mediumUri = primaryImage?.medium || primaryImage?.url;

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const originDetails = [
    breed.origin.country,
    breed.origin.region,
    breed.origin.era,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Hero Image */}
      {mediumUri && (
        <View style={styles.heroContainer}>
          <CachedImage
            uri={mediumUri}
            variant="medium"
            fallbackText={breed.name}
            style={styles.heroImage}
            accessibilityLabel={`${breed.name} feature photo`}
          />
          {primaryImage?.attribution && (
            <View style={styles.heroAttribution}>
              <Text style={styles.attributionText} numberOfLines={1}>
                Photo: {primaryImage.attribution.author} ({primaryImage.attribution.license})
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Description */}
      {breed.description.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            About the Breed
          </Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            {breed.description}
          </Text>
        </View>
      )}

      {/* Vital Statistics Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Physical Attributes & Lifespan
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Life Span
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRange(breed.life, 'years')}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Male Weight
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRange(breed.maleWeight, 'kg')}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Female Weight
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRange(breed.femaleWeight, 'kg')}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Male Height
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRange(breed.maleHeight, 'cm')}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Female Height
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {formatRange(breed.femaleHeight, 'cm')}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Hypoallergenic
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              {breed.hypoallergenic ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </View>

      {/* Origin Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Heritage & Origin
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          {originDetails || 'Historical lineage not documented'}
        </Text>

        {breed.coat.type && (
          <View style={styles.subRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Coat:{' '}
            </Text>
            <Text style={[styles.inlineValue, { color: colors.textPrimary }]}>
              {breed.coat.type} ({breed.coat.length || 'medium'} length)
            </Text>
          </View>
        )}
      </View>

      {/* Alternative Names */}
      {breed.otherNames.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Also Known As
          </Text>
          <View style={styles.chipsContainer}>
            {breed.otherNames.map((name) => (
              <View
                key={name}
                style={[
                  styles.chip,
                  { backgroundColor: colors.surfaceHover },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recognized Kennel Clubs */}
      {breed.recognizedBy.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Recognizing Organizations
          </Text>
          <View style={styles.chipsContainer}>
            {breed.recognizedBy.map((club) => (
              <View
                key={club}
                style={[
                  styles.clubBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={[styles.clubText, { color: colors.primary }]}>
                  {club}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Sources & Standards */}
      {breed.sources.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Official Standards & Documentation
          </Text>
          {breed.sources.map((src, idx) => (
            <TouchableOpacity
              key={`${src.url}-${idx}`}
              style={styles.linkRow}
              onPress={() => openLink(src.url)}
              accessibilityRole="link"
              accessibilityLabel={`Open ${src.title}`}
            >
              <Text style={styles.linkIcon}>🔗</Text>
              <Text
                style={[styles.linkText, { color: colors.primary }]}
                numberOfLines={1}
              >
                {src.title || src.url}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  heroContainer: {
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroAttribution: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  attributionText: {
    color: '#E2E8F0',
    fontSize: 11,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14,
  },
  statItem: {
    width: '50%',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  inlineValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clubBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  clubText: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
    flex: 1,
  },
});
