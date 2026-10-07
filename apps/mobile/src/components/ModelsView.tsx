import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type { OnDeviceModel, DeviceMemoryProfile, MemoryPagingConfig } from '../types';
import { ZAYLO_MODELS, ZayloModel } from '../engine/modelsCatalog';
import { Icon } from './common/Icon';

interface ModelsViewProps {
  theme: Theme;
  activeModel: OnDeviceModel;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onSelectModel: (model: OnDeviceModel) => void;
  onBackToHome: () => void;
  onOpenChat: () => void;
}

type ModelCategory = 'all' | 'installed' | 'compact' | 'high_capacity';

export const ModelsView: React.FC<ModelsViewProps> = ({
  theme,
  activeModel,
  onSelectModel,
  onBackToHome,
  onOpenChat,
}) => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [temperature, setTemperature] = useState(0.7); // 0.2 (Precise) to 1.0 (Creative)

  const filteredModels = useMemo(() => {
    let list: ZayloModel[] = ZAYLO_MODELS;

    if (activeCategory === 'installed') {
      list = ZAYLO_MODELS.filter((m) => m.isInstalled || m.id === activeModel.id);
    } else if (activeCategory === 'compact') {
      list = ZAYLO_MODELS.filter((m) => m.sizeMb < 1000);
    } else if (activeCategory === 'high_capacity') {
      list = ZAYLO_MODELS.filter((m) => m.sizeMb >= 1000);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.publisher.toLowerCase().includes(q) ||
          m.parameterCount.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery, activeModel.id]);

  const handleSelect = (model: ZayloModel) => {
    const converted: OnDeviceModel = {
      id: model.id,
      name: model.name,
      tagline: model.description,
      parameters: model.parameterCount,
      sizeMb: model.sizeMb,
      requiredRamMb: Math.round(model.sizeMb * 1.3),
      minTier: model.sizeMb > 1500 ? 'tier_3_flagship' : 'tier_2_balanced',
      quantization: model.quantization,
      downloadUrl: model.downloadUrl,
      isDownloaded: model.isInstalled,
    };
    onSelectModel(converted);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header (Matching Right Screen in Reference UI) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onBackToHome}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={18} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Model Studio
        </Text>

        <TouchableOpacity
          style={[
            styles.chatShortcutBtn,
            { backgroundColor: theme.floatingNav },
            theme.shadows.sm,
          ]}
          onPress={onOpenChat}
          activeOpacity={0.8}
        >
          <Icon name="message-square" size={14} color="#ffffff" />
          <Text style={styles.chatShortcutText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Top Metric Cards (Matching "Humidity 45%" & "Temperature 28°C" in Reference UI) */}
      <View style={styles.topMetricsRow}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.pastels.purple.bg,
              borderColor: theme.pastels.purple.border,
            },
            theme.shadows.sm,
          ]}
        >
          <Text style={[styles.metricLabel, { color: theme.pastels.purple.text }]}>
            Parameters
          </Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {activeModel.parameters || '1.2B'}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: theme.pastels.blue.bg,
              borderColor: theme.pastels.blue.border,
            },
            theme.shadows.sm,
          ]}
        >
          <Text style={[styles.metricLabel, { color: theme.pastels.blue.text }]}>
            Weights Size
          </Text>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>
            {activeModel.sizeMb} <Text style={styles.metricUnit}>MB</Text>
          </Text>
        </View>
      </View>

      {/* 3. Circular Parameter Control Dial (Matching Center Arc Dial in Reference UI) */}
      <View
        style={[
          styles.dialCard,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          theme.shadows.md,
        ]}
      >
        <Text style={[styles.dialSubtitle, { color: theme.textMuted }]}>
          SAMPLING TEMPERATURE
        </Text>

        <View style={styles.dialArcContainer}>
          {/* Circular gradient arc ring */}
          <View style={styles.dialRing}>
            <View style={[styles.dialInner, { backgroundColor: theme.backgroundSecondary }]}>
              <Text style={[styles.dialCenterNumber, { color: theme.textPrimary }]}>
                {temperature.toFixed(2)}
              </Text>
              <Text style={[styles.dialCenterLabel, { color: theme.accent }]}>
                {temperature <= 0.3 ? 'Deterministic' : temperature <= 0.7 ? 'Balanced' : 'Creative'}
              </Text>
            </View>
          </View>
        </View>

        {/* Temperature Stepper Buttons */}
        <View style={styles.stepperRow}>
          {[0.2, 0.5, 0.7, 0.9].map((temp) => (
            <TouchableOpacity
              key={temp}
              style={[
                styles.stepperPill,
                temperature === temp
                  ? [styles.stepperPillActive, { backgroundColor: theme.floatingNav }]
                  : [styles.stepperPillInactive, { backgroundColor: theme.backgroundSecondary }],
              ]}
              onPress={() => setTemperature(temp)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.stepperPillText,
                  { color: temperature === temp ? '#ffffff' : theme.textPrimary },
                ]}
              >
                {temp === 0.2 ? 'Precise (0.2)' : temp === 0.5 ? 'Code (0.5)' : temp === 0.7 ? 'Chat (0.7)' : 'Creative (0.9)'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Category Filter Tabs */}
      <View style={styles.categorySection}>
        <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
          CERTIFIED SLM CATALOG
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {[
            { id: 'all', label: 'All Models' },
            { id: 'installed', label: 'Ready / Installed' },
            { id: 'compact', label: 'Compact (< 1GB)' },
            { id: 'high_capacity', label: 'High Capacity (3B+)' },
          ].map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? [styles.categoryPillActive, { backgroundColor: theme.floatingNav }, theme.shadows.sm]
                    : [styles.categoryPillInactive, { backgroundColor: theme.card, borderColor: theme.cardBorder }],
                ]}
                onPress={() => setActiveCategory(cat.id as ModelCategory)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? '#ffffff' : theme.textPrimary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. Search Bar */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          theme.shadows.sm,
        ]}
      >
        <Icon name="search" size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search models, publishers, architectures..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 6. Models Cards List */}
      <View style={styles.modelsList}>
        {filteredModels.map((model) => {
          const isSelected = model.id === activeModel.id;

          return (
            <View
              key={model.id}
              style={[
                styles.modelCard,
                {
                  backgroundColor: theme.card,
                  borderColor: isSelected ? theme.accent : theme.cardBorder,
                },
                isSelected && styles.modelCardSelected,
                theme.shadows.sm,
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.modelName, { color: theme.textPrimary }]}>
                      {model.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.activePill, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                        <View style={[styles.activeDot, { backgroundColor: theme.success }]} />
                        <Text style={[styles.activePillText, { color: theme.success }]}>
                          ACTIVE
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modelPublisher, { color: theme.textMuted }]}>
                    {model.publisher} • {model.parameterCount}
                  </Text>
                </View>

                <View style={[styles.formatBadge, { backgroundColor: theme.backgroundSecondary }]}>
                  <Text style={[styles.formatBadgeText, { color: theme.textSecondary }]}>
                    {model.quantization}
                  </Text>
                </View>
              </View>

              <Text style={[styles.modelDesc, { color: theme.textSecondary }]}>
                {model.description}
              </Text>

              {/* Specs Grid */}
              <View style={[styles.specsGrid, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
                <View style={styles.specBox}>
                  <Text style={[styles.specLabel, { color: theme.textMuted }]}>SIZE</Text>
                  <Text style={[styles.specVal, { color: theme.textPrimary }]}>{model.sizeMb} MB</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={[styles.specLabel, { color: theme.textMuted }]}>CONTEXT</Text>
                  <Text style={[styles.specVal, { color: theme.textPrimary }]}>{model.contextLength} ctx</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={[styles.specLabel, { color: theme.textMuted }]}>CAPABILITY</Text>
                  <Text style={[styles.specVal, { color: theme.textPrimary }]}>{model.capabilities[0]}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
                <View style={styles.tagsRow}>
                  {model.capabilities.map((cap, i) => (
                    <View key={i} style={[styles.capChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Text style={[styles.capChipText, { color: theme.textMuted }]}>{cap}</Text>
                    </View>
                  ))}
                </View>

                {isSelected ? (
                  <TouchableOpacity
                    style={[
                      styles.loadButtonActive,
                      { backgroundColor: theme.successLight, borderColor: theme.success },
                    ]}
                    onPress={onOpenChat}
                    activeOpacity={0.8}
                  >
                    <Icon name="check" size={13} color={theme.success} />
                    <Text style={[styles.loadButtonText, { color: theme.success }]}>Active</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.loadButton,
                      { backgroundColor: theme.floatingNav },
                      theme.shadows.sm,
                    ]}
                    onPress={() => handleSelect(model)}
                    activeOpacity={0.8}
                  >
                    <Icon name="play" size={12} color="#ffffff" />
                    <Text style={styles.loadButtonTextWhite}>Load Model</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 14 : 18,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chatShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  chatShortcutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  topMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '600',
  },
  dialCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    marginBottom: 24,
  },
  dialSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  dialArcContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dialRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 8,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  dialInner: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialCenterNumber: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  dialCenterLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  stepperPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  stepperPillActive: {},
  stepperPillInactive: {},
  stepperPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
  },
  categoryPillActive: {},
  categoryPillInactive: {
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  modelsList: {
    gap: 14,
  },
  modelCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  modelCardSelected: {
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelPublisher: {
    fontSize: 12,
    marginTop: 2,
  },
  formatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formatBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  specBox: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  capChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  capChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loadButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  loadButtonTextWhite: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
