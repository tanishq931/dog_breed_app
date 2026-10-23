import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../theme/useTheme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isPartial?: boolean;
}

export function ErrorBanner({
  message,
  onRetry,
  onDismiss,
  isPartial = false,
}: ErrorBannerProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.errorSurface,
          borderColor: colors.errorBorder,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel={`Notice: ${message}`}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.error }]}>
          {isPartial ? '⚠️ Partial Sync' : '⚠️ Sync Error'}
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
        <Text style={[styles.subtext, { color: colors.textMuted }]}>
          Displaying cached data.
        </Text>
      </View>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.error }]}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry syncing"
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error banner"
          >
            <Text style={[styles.dismissText, { color: colors.textMuted }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 6,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
