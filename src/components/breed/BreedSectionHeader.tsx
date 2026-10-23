import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../theme/useTheme';

interface BreedSectionHeaderProps {
  title: string;
  count: number;
}

export function BreedSectionHeader({ title, count }: BreedSectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
      accessibilityRole="header"
      accessibilityLabel={`${title}, ${count} breeds`}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {title}
      </Text>
      <View
        style={[styles.countBadge, { backgroundColor: colors.surfaceHover }]}
      >
        <Text style={[styles.countText, { color: colors.textSecondary }]}>
          {count}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
