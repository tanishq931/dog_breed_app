import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppTheme } from '../../theme/useTheme';
import { formatFreshness } from '../../utils/formatters';

interface FreshnessBadgeProps {
  lastSyncedAt: number | null;
  isSyncing: boolean;
  isOffline: boolean;
  isPartial: boolean;
}

export function FreshnessBadge({
  lastSyncedAt,
  isSyncing,
  isOffline,
  isPartial,
}: FreshnessBadgeProps) {
  const { colors } = useAppTheme();

  let statusText = `Synced ${formatFreshness(lastSyncedAt)}`;
  let dotColor = colors.success;

  if (isSyncing) {
    statusText = 'Updating breeds...';
    dotColor = colors.primary;
  } else if (isOffline) {
    statusText = `Offline (Synced ${formatFreshness(lastSyncedAt)})`;
    dotColor = colors.warning;
  } else if (isPartial) {
    statusText = `Partial sync (${formatFreshness(lastSyncedAt)})`;
    dotColor = colors.warning;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Sync status: ${statusText}`}
    >
      {isSyncing ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.spinner}
        />
      ) : (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}
      <Text style={[styles.text, { color: colors.textSecondary }]}>
        {statusText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  spinner: {
    marginRight: 6,
    transform: [{ scale: 0.65 }],
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
