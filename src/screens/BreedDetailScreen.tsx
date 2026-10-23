import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GalleryTab } from '../components/breed/GalleryTab';
import { OverviewTab } from '../components/breed/OverviewTab';
import { TraitsTab } from '../components/breed/TraitsTab';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useBreedStore } from '../store/breedStore';
import { useAppTheme } from '../theme/useTheme';
import type { BreedDetailScreenProps } from '../types/navigation';

type DetailTab = 'overview' | 'traits' | 'gallery';

export function BreedDetailScreen({ route, navigation }: BreedDetailScreenProps) {
  const { breedId, breedName } = route.params;
  const { colors } = useAppTheme();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const breed = useBreedStore((s) => s.breedsById[breedId]);
  const enrichBreed = useBreedStore((s) => s.enrichBreed);

  // Background detail refresh/enrichment on mount
  useEffect(() => {
    enrichBreed(breedId);
  }, [breedId, enrichBreed]);

  if (!breed) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Breed Not Found
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textMuted }]}>
            Unable to locate data for &quot;{breedName}&quot;.
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back to breed list"
          >
            <Text style={styles.backButtonText}>Return to Breeds</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to breed list"
        >
          <Text style={[styles.navButtonText, { color: colors.primary }]}>
            ‹ Breeds
          </Text>
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text
            style={[styles.headerTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
          >
            {breed.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {breed.groupName}
          </Text>
        </View>

        <View style={styles.navPlaceholder} />
      </View>

      {/* Segmented Tab Bar */}
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'overview' && [
              styles.activeTabItem,
              { borderBottomColor: colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('overview')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'overview' }}
          accessibilityLabel="Overview tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'overview'
                ? [styles.activeTabText, { color: colors.primary }]
                : [styles.inactiveTabText, { color: colors.textSecondary }],
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'traits' && [
              styles.activeTabItem,
              { borderBottomColor: colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('traits')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'traits' }}
          accessibilityLabel="Traits tab"
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'traits'
                ? [styles.activeTabText, { color: colors.primary }]
                : [styles.inactiveTabText, { color: colors.textSecondary }],
            ]}
          >
            Traits & Scale
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'gallery' && [
              styles.activeTabItem,
              { borderBottomColor: colors.primary },
            ],
          ]}
          onPress={() => setActiveTab('gallery')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'gallery' }}
          accessibilityLabel={`Gallery tab, ${breed.images.length} photos`}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'gallery'
                ? [styles.activeTabText, { color: colors.primary }]
                : [styles.inactiveTabText, { color: colors.textSecondary }],
            ]}
          >
            Gallery ({breed.images.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab View with Error Boundary */}
      <ErrorBoundary fallbackTitle={`Error rendering ${activeTab} tab`}>
        {activeTab === 'overview' && <OverviewTab breed={breed} />}
        {activeTab === 'traits' && <TraitsTab breed={breed} />}
        {activeTab === 'gallery' && (
          <GalleryTab images={breed.images} breedName={breed.name} />
        )}
      </ErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  navPlaceholder: {
    width: 60,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
  },
  activeTabText: {
    fontWeight: '700',
  },
  inactiveTabText: {
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
