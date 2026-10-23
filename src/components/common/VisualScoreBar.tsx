import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/useTheme';
import { formatTraitLabel } from '../../utils/formatters';

interface VisualScoreBarProps {
  traitKey: string;
  score: number;
  maxScore?: number;
  isMinutes?: boolean;
}

export function VisualScoreBar({
  traitKey,
  score,
  maxScore = 5,
  isMinutes = false,
}: VisualScoreBarProps) {
  const { colors } = useAppTheme();
  const label = formatTraitLabel(traitKey);

  if (isMinutes) {
    const percentage = Math.min(100, Math.max(10, (score / 120) * 100));
    return (
      <View
        style={[styles.container, { borderColor: colors.border }]}
        accessibilityRole="text"
        accessibilityLabel={`${label}: ${score} minutes per day`}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            {label}
          </Text>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {score} mins / day
          </Text>
        </View>
        <View
          style={[styles.track, { backgroundColor: colors.surfaceHover }]}
        >
          <View
            style={[
              styles.fill,
              { width: `${percentage}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>
    );
  }

  // 1 to 5 scale
  const normalizedScore = Math.min(maxScore, Math.max(1, Math.round(score)));
  const percentage = (normalizedScore / maxScore) * 100;

  const scoreLabels = ['', 'Low', 'Moderate', 'Average', 'High', 'Very High'];
  const descriptor = scoreLabels[normalizedScore] || `${normalizedScore}/5`;

  let barColor = colors.primary;
  if (normalizedScore <= 2) barColor = colors.accent;
  if (normalizedScore >= 4) barColor = colors.success;

  return (
    <View
      style={[styles.container, { borderColor: colors.border }]}
      accessibilityRole="text"
      accessibilityLabel={`${label}: score ${normalizedScore} out of ${maxScore}, ${descriptor}`}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>
          {label}
        </Text>
        <View style={styles.badgeRow}>
          <Text style={[styles.descriptor, { color: colors.textSecondary }]}>
            {descriptor}
          </Text>
          <View style={[styles.pill, { backgroundColor: colors.surfaceHover }]}>
            <Text style={[styles.scoreText, { color: colors.textPrimary }]}>
              {normalizedScore}/{maxScore}
            </Text>
          </View>
        </View>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.surfaceHover }]}
      >
        <View
          style={[
            styles.fill,
            { width: `${percentage}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  descriptor: {
    fontSize: 12,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
