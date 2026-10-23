import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BreedCard } from '../components/breed/BreedCard';
import { BreedSectionHeader } from '../components/breed/BreedSectionHeader';
import { FilterModal } from '../components/breed/FilterModal';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { FreshnessBadge } from '../components/common/FreshnessBadge';
import { SearchBar } from '../components/common/SearchBar';
import { useDebounce } from '../hooks/useDebounce';
import { useBreedStore } from '../store/breedStore';
import { useAppTheme } from '../theme/useTheme';
import type { Breed } from '../types/breed';
import type { BreedListScreenProps } from '../types/navigation';
import {
  countActiveFilters,
  filterBreed,
  groupBreedsByGroup,
} from '../utils/filters';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BreedListScreen({ navigation }: BreedListScreenProps) {
  const { colors } = useAppTheme();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const debouncedSearch = useDebounce(searchInput, 250);

  // Store selectors
  const breedsById = useBreedStore((s) => s.breedsById);
  const breedIds = useBreedStore((s) => s.breedIds);
  const groupsById = useBreedStore((s) => s.groupsById);
  const groupIds = useBreedStore((s) => s.groupIds);
  const filters = useBreedStore((s) => s.filters);
  const isSyncing = useBreedStore((s) => s.isSyncing);
  const isOffline = useBreedStore((s) => s.isOffline);
  const lastSyncedAt = useBreedStore((s) => s.lastSyncedAt);
  const syncError = useBreedStore((s) => s.syncError);
  const isPartial = useBreedStore((s) => s.isPartial);
  const isInitialized = useBreedStore((s) => s.isInitialized);

  const sync = useBreedStore((s) => s.sync);
  const setFilters = useBreedStore((s) => s.setFilters);
  const dismissSyncError = useBreedStore((s) => s.dismissSyncError);

  // Update store search query when debounced text changes
  React.useEffect(() => {
    setFilters({ searchQuery: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const allBreeds = useMemo(() => {
    return breedIds.map((id) => breedsById[id]).filter(Boolean);
  }, [breedIds, breedsById]);

  const allGroups = useMemo(() => {
    return groupIds.map((id) => groupsById[id]).filter(Boolean);
  }, [groupIds, groupsById]);

  // Filtered and grouped sections
  const filteredBreeds = useMemo(() => {
    return allBreeds.filter((b) => filterBreed(b, filters));
  }, [allBreeds, filters]);

  const sections = useMemo(() => {
    return groupBreedsByGroup(filteredBreeds);
  }, [filteredBreeds]);

  const activeFilterCount = useMemo(() => {
    return countActiveFilters(filters);
  }, [filters]);

  const handleBreedPress = useCallback(
    (breed: Breed) => {
      navigation.navigate('BreedDetail', {
        breedId: breed.id,
        breedName: breed.name,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Breed }) => {
      return <BreedCard breed={item} onPress={handleBreedPress} />;
    },
    [handleBreedPress],
  );

  const renderSectionHeader = useCallback(
    ({ section: { title, data } }: { section: { title: string; data: Breed[] } }) => {
      return <BreedSectionHeader title={title} count={data.length} />;
    },
    [],
  );

  const keyExtractor = useCallback((item: Breed) => item.id, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Top Bar with Search & Filter Trigger */}
      <View style={styles.topBar}>
        <SearchBar value={searchInput} onChangeText={setSearchInput} />

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor:
                activeFilterCount > 0 ? colors.primary : colors.surface,
              borderColor:
                activeFilterCount > 0 ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={`Open filters modal, ${activeFilterCount} active filters`}
        >
          <Text style={styles.filterIcon}>
            ⚙️
          </Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Freshness Badge & Status Row */}
      <View style={styles.statusRow}>
        <FreshnessBadge
          lastSyncedAt={lastSyncedAt}
          isSyncing={isSyncing}
          isOffline={isOffline}
          isPartial={isPartial}
        />
        <Text style={[styles.countLabel, { color: colors.textMuted }]}>
          {filteredBreeds.length} of {allBreeds.length} breeds
        </Text>
      </View>

      {/* Error / Partial Sync Banner */}
      {syncError && (
        <ErrorBanner
          message={syncError}
          isPartial={isPartial}
          onRetry={() => sync({ force: true })}
          onDismiss={dismissSyncError}
        />
      )}

      {/* Loading Skeleton on first launch before local cache is ready */}
      {!isInitialized && allBreeds.length === 0 ? (
        <View style={styles.initialLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>
            Loading breed registry...
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={isSyncing}
              onRefresh={() => sync({ force: true })}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Breeds Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                No dog breeds matched your current search and filter criteria.
              </Text>
            </View>
          }
        />
      )}

      {/* Filters Bottom Sheet */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        groups={allGroups}
        totalMatches={filteredBreeds.length}
        onApply={(updated) => setFilters(updated)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIcon: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  countLabel: {
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  initialLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
