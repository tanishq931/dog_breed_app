import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { CachedImage } from '../common/CachedImage';
import { useAppTheme } from '../../theme/useTheme';
import type { BreedImage } from '../../types/breed';

interface GalleryTabProps {
  images: BreedImage[];
  breedName: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_WIDTH = SCREEN_WIDTH - 32;

export function GalleryTab({ images, breedName }: GalleryTabProps) {
  const { colors } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<BreedImage>>(null);

  if (!images || images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>📷</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No Gallery Images
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Photographs for {breedName} have not yet been cataloged.
        </Text>
      </View>
    );
  }

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SLIDE_WIDTH);
    if (nextIndex >= 0 && nextIndex < images.length) {
      setActiveIndex(nextIndex);
    }
  };

  const jumpToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const activeImage = images[activeIndex] || images[0];
  const attribution = activeImage?.attribution;

  const openUrl = (url?: string) => {
    if (!url) return;
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
    });
  };

  return (
    <View style={styles.container}>
      {/* Counter */}
      <View style={styles.counterRow}>
        <Text style={[styles.counterText, { color: colors.textSecondary }]}>
          Photo {activeIndex + 1} of {images.length}
        </Text>
      </View>

      {/* Swipeable Viewport */}
      <FlatList
        ref={flatListRef}
        data={images}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SLIDE_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          // Large variant prioritized for gallery with medium fallback
          const imageUri = item.large || item.medium || item.url;
          return (
            <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
              <CachedImage
                uri={imageUri}
                variant="large"
                fallbackText={breedName}
                style={styles.image}
                accessibilityLabel={`${breedName} gallery image ${index + 1} of ${images.length}`}
              />
            </View>
          );
        }}
      />

      {/* Surface Full Attribution */}
      {attribution && (
        <View
          style={[
            styles.attributionCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.attrTitle, { color: colors.textPrimary }]}>
            Attribution & Licensing
          </Text>

          <View style={styles.attrRow}>
            <Text style={[styles.attrLabel, { color: colors.textMuted }]}>
              Photographer:
            </Text>
            <Text
              style={[styles.attrValue, { color: colors.textPrimary }]}
              numberOfLines={1}
            >
              {attribution.author || 'Unknown'}
            </Text>
          </View>

          <View style={styles.attrRow}>
            <Text style={[styles.attrLabel, { color: colors.textMuted }]}>
              License:
            </Text>
            <TouchableOpacity
              onPress={() => openUrl(attribution.license_url)}
              disabled={!attribution.license_url}
              accessibilityRole="link"
              accessibilityLabel={`View ${attribution.license} license details`}
            >
              <Text
                style={[
                  styles.attrLink,
                  { color: colors.primary },
                  attribution.license_url ? styles.underlined : null,
                ]}
              >
                {attribution.license || 'Public Domain'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.attrRow}>
            <Text style={[styles.attrLabel, { color: colors.textMuted }]}>
              Source:
            </Text>
            <TouchableOpacity
              onPress={() => openUrl(attribution.source_url)}
              disabled={!attribution.source_url}
              accessibilityRole="link"
              accessibilityLabel={`View source at ${attribution.source}`}
            >
              <Text
                style={[
                  styles.attrLink,
                  { color: colors.primary },
                  attribution.source_url ? styles.underlined : null,
                ]}
              >
                {attribution.source || 'Original Archive'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <View style={styles.thumbStrip}>
          {images.map((img, idx) => {
            const isSelected = idx === activeIndex;
            const thumb = img.thumb || img.url;
            return (
              <TouchableOpacity
                key={img.id}
                onPress={() => jumpToIndex(idx)}
                style={[
                  styles.thumbWrapper,
                  isSelected
                    ? [styles.selectedThumb, { borderColor: colors.primary }]
                    : [styles.unselectedThumb, { borderColor: colors.border }],
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Select photo ${idx + 1}`}
              >
                <CachedImage
                  uri={thumb}
                  variant="thumb"
                  style={styles.thumbImage}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  counterRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 4,
  },
  slide: {
    height: 280,
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  attributionCard: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  attrTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  attrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  attrLabel: {
    fontSize: 12,
  },
  attrValue: {
    fontSize: 12,
    fontWeight: '500',
    maxWidth: '65%',
  },
  attrLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  underlined: {
    textDecorationLine: 'underline',
  },
  thumbStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
    justifyContent: 'center',
  },
  thumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedThumb: {
    borderWidth: 2,
  },
  unselectedThumb: {
    borderWidth: 1,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
