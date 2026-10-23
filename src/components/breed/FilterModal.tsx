import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../theme/useTheme';
import type { BreedGroup, FilterState, SizeBand } from '../../types/breed';
import { countActiveFilters, INITIAL_FILTERS } from '../../utils/filters';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  groups: BreedGroup[];
  totalMatches: number;
  onApply: (filters: FilterState) => void;
}

const SIZE_OPTIONS: Array<{ key: SizeBand; label: string; desc: string }> = [
  { key: 'small', label: 'Small', desc: '<10 kg' },
  { key: 'medium', label: 'Medium', desc: '10-25 kg' },
  { key: 'large', label: 'Large', desc: '25-45 kg' },
  { key: 'giant', label: 'Giant', desc: '>45 kg' },
];

const COAT_OPTIONS = [
  { key: 'short', label: 'Short' },
  { key: 'medium', label: 'Medium' },
  { key: 'long', label: 'Long' },
  { key: 'wire', label: 'Wire' },
];

const THRESHOLD_STEPS = [0, 2, 3, 4, 5];

export function FilterModal({
  visible,
  onClose,
  filters,
  groups,
  totalMatches,
  onApply,
}: FilterModalProps) {
  const { colors } = useAppTheme();
  const [draft, setDraft] = useState<FilterState>(filters);

  // Synchronize draft when opening modal
  React.useEffect(() => {
    if (visible) {
      setDraft(filters);
    }
  }, [visible, filters]);

  const toggleGroup = (groupId: string) => {
    setDraft((prev) => {
      const exists = prev.selectedGroupIds.includes(groupId);
      return {
        ...prev,
        selectedGroupIds: exists
          ? prev.selectedGroupIds.filter((id) => id !== groupId)
          : [...prev.selectedGroupIds, groupId],
      };
    });
  };

  const toggleSize = (size: SizeBand) => {
    setDraft((prev) => {
      const exists = prev.selectedSizeBands.includes(size);
      return {
        ...prev,
        selectedSizeBands: exists
          ? prev.selectedSizeBands.filter((s) => s !== size)
          : [...prev.selectedSizeBands, size],
      };
    });
  };

  const toggleCoat = (coat: string) => {
    setDraft((prev) => {
      const exists = prev.selectedCoatLengths.includes(coat);
      return {
        ...prev,
        selectedCoatLengths: exists
          ? prev.selectedCoatLengths.filter((c) => c !== coat)
          : [...prev.selectedCoatLengths, coat],
      };
    });
  };

  const handleReset = () => {
    setDraft({
      ...INITIAL_FILTERS,
      searchQuery: draft.searchQuery, // keep search query intact
    });
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const activeCount = countActiveFilters(draft);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close filter options"
          >
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Filters {activeCount > 0 ? `(${activeCount})` : ''}
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reset all filters"
          >
            <Text style={[styles.resetText, { color: colors.primary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Breed Groups */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Breed Groups
            </Text>
            <View style={styles.chipGrid}>
              {groups.map((group) => {
                const selected = draft.selectedGroupIds.includes(group.id);
                return (
                  <TouchableOpacity
                    key={group.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surface,
                        borderColor: selected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleGroup(group.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Group ${group.name}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected
                          ? styles.chipTextSelected
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {group.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Size Band */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Size Category
            </Text>
            <View style={styles.chipGrid}>
              {SIZE_OPTIONS.map((opt) => {
                const selected = draft.selectedSizeBands.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surface,
                        borderColor: selected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleSize(opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Size ${opt.label}, ${opt.desc}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected
                          ? styles.chipTextSelected
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {opt.label} ({opt.desc})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Coat Length */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Coat Length / Type
            </Text>
            <View style={styles.chipGrid}>
              {COAT_OPTIONS.map((opt) => {
                const selected = draft.selectedCoatLengths.includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surface,
                        borderColor: selected
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                    onPress={() => toggleCoat(opt.key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`Coat ${opt.label}`}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected
                          ? styles.chipTextSelected
                          : { color: colors.textPrimary },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Hypoallergenic */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Hypoallergenic
            </Text>
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[
                  styles.segmentOption,
                  {
                    backgroundColor:
                      draft.hypoallergenicOnly === null
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  setDraft((prev) => ({ ...prev, hypoallergenicOnly: null }))
                }
                accessibilityRole="button"
                accessibilityLabel="Show all breeds"
              >
                <Text
                  style={[
                    styles.segmentText,
                    draft.hypoallergenicOnly === null
                      ? styles.segmentTextSelected
                      : { color: colors.textPrimary },
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentOption,
                  {
                    backgroundColor:
                      draft.hypoallergenicOnly === true
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() =>
                  setDraft((prev) => ({ ...prev, hypoallergenicOnly: true }))
                }
                accessibilityRole="button"
                accessibilityLabel="Show hypoallergenic breeds only"
              >
                <Text
                  style={[
                    styles.segmentText,
                    draft.hypoallergenicOnly === true
                      ? styles.segmentTextSelected
                      : { color: colors.textPrimary },
                  ]}
                >
                  Hypoallergenic Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trait Thresholds */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Trait Thresholds (Minimum Score)
            </Text>

            {/* Good with children */}
            <View style={styles.stepperRow}>
              <Text style={[styles.stepperLabel, { color: colors.textPrimary }]}>
                Good with Children
              </Text>
              <View style={styles.stepPills}>
                {THRESHOLD_STEPS.map((step) => {
                  const active = draft.minGoodWithChildren === step;
                  return (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.stepPill,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setDraft((prev) => ({
                          ...prev,
                          minGoodWithChildren: step,
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Good with children minimum ${step === 0 ? 'Any' : `${step}+`}`}
                    >
                      <Text
                        style={[
                          styles.stepText,
                          active
                            ? styles.stepTextSelected
                            : { color: colors.textPrimary },
                        ]}
                      >
                        {step === 0 ? 'Any' : `${step}+`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Good with dogs */}
            <View style={styles.stepperRow}>
              <Text style={[styles.stepperLabel, { color: colors.textPrimary }]}>
                Good with Dogs
              </Text>
              <View style={styles.stepPills}>
                {THRESHOLD_STEPS.map((step) => {
                  const active = draft.minGoodWithDogs === step;
                  return (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.stepPill,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setDraft((prev) => ({
                          ...prev,
                          minGoodWithDogs: step,
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Good with dogs minimum ${step === 0 ? 'Any' : `${step}+`}`}
                    >
                      <Text
                        style={[
                          styles.stepText,
                          active
                            ? styles.stepTextSelected
                            : { color: colors.textPrimary },
                        ]}
                      >
                        {step === 0 ? 'Any' : `${step}+`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Good with strangers */}
            <View style={styles.stepperRow}>
              <Text style={[styles.stepperLabel, { color: colors.textPrimary }]}>
                Good with Strangers
              </Text>
              <View style={styles.stepPills}>
                {THRESHOLD_STEPS.map((step) => {
                  const active = draft.minGoodWithStrangers === step;
                  return (
                    <TouchableOpacity
                      key={step}
                      style={[
                        styles.stepPill,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.surface,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() =>
                        setDraft((prev) => ({
                          ...prev,
                          minGoodWithStrangers: step,
                        }))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`Good with strangers minimum ${step === 0 ? 'Any' : `${step}+`}`}
                    >
                      <Text
                        style={[
                          styles.stepText,
                          active
                            ? styles.stepTextSelected
                            : { color: colors.textPrimary },
                        ]}
                      >
                        {step === 0 ? 'Any' : `${step}+`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
            accessibilityRole="button"
            accessibilityLabel={`Apply filters, ${totalMatches} matching breeds`}
          >
            <Text style={styles.applyText}>
              Show {totalMatches} {totalMatches === 1 ? 'Breed' : 'Breeds'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeText: {
    fontSize: 15,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperRow: {
    marginBottom: 14,
  },
  stepperLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  stepPills: {
    flexDirection: 'row',
    gap: 6,
  },
  stepPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  segmentText: {
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: '#FFFFFF',
  },
  stepTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
