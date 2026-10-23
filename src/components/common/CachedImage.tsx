import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageProps,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { recordCachedImage } from '../../db/storage';
import { useAppTheme } from '../../theme/useTheme';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  variant?: 'thumb' | 'medium' | 'large';
  fallbackText?: string;
}

export function CachedImage({
  uri,
  variant = 'thumb',
  fallbackText,
  style,
  ...props
}: CachedImageProps) {
  const { colors } = useAppTheme();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!uri || hasError) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: colors.surfaceHover, borderColor: colors.border },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={props.accessibilityLabel || 'Placeholder dog image'}
      >
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
          {fallbackText ? fallbackText.slice(0, 2).toUpperCase() : '🐕'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Image
        {...props}
        source={{ uri }}
        style={[StyleSheet.absoluteFill, style]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => {
          setIsLoading(false);
          recordCachedImage(uri, variant);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      {isLoading && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: colors.surfaceHover },
          ]}
        >
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
