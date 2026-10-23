import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VisualScoreBar } from '../common/VisualScoreBar';
import { useAppTheme } from '../../theme/useTheme';
import type { Breed } from '../../types/breed';

interface TraitsTabProps {
  breed: Breed;
}

export function TraitsTab({ breed }: TraitsTabProps) {
  const { colors } = useAppTheme();
  const traits = breed.traits;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Temperament Tag Cloud */}
      {traits.temperament.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Temperament & Personality
          </Text>
          <View style={styles.tagCloud}>
            {traits.temperament.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tagPill,
                  { backgroundColor: colors.accentLight },
                ]}
              >
                <Text style={[styles.tagText, { color: colors.accent }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Visual Traits Scales */}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Behavioral & Physical Traits
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
          Visual rating spectrum calibrated on a 1 to 5 scale
        </Text>

        <VisualScoreBar traitKey="energy" score={traits.energy} />
        <VisualScoreBar traitKey="barking" score={traits.barking} />
        <VisualScoreBar traitKey="drooling" score={traits.drooling} />
        <VisualScoreBar traitKey="grooming" score={traits.grooming} />
        <VisualScoreBar traitKey="shedding" score={traits.shedding} />
        <VisualScoreBar traitKey="trainability" score={traits.trainability} />
        <VisualScoreBar traitKey="apartment_friendly" score={traits.apartment_friendly} />
        <VisualScoreBar traitKey="good_with_dogs" score={traits.good_with_dogs} />
        <VisualScoreBar traitKey="good_with_children" score={traits.good_with_children} />
        <VisualScoreBar traitKey="good_with_strangers" score={traits.good_with_strangers} />
        <VisualScoreBar
          traitKey="exercise_minutes"
          score={traits.exercise_minutes}
          isMinutes
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
