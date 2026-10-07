import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type { OnDeviceModel, DeviceMemoryProfile, MemoryPagingConfig, DownloadProgress } from '../types';
import { ZAYLO_MODELS, ZayloModel } from '../engine/modelsCatalog';
import { ModelStorage } from '../engine/modelStorage';
import { Icon } from './common/Icon';

/**
 * Smooth Animated Progress Bar for progressive model weight downloads
 */
const SmoothProgressBar: React.FC<{
  percent: number;
  trackColor: string;
  fillColor: string;
}> = ({ percent, trackColor, fillColor }) => {
  const animatedPercent = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    Animated.timing(animatedPercent, {
      toValue: Math.max(0, Math.min(100, percent)),
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [percent, animatedPercent]);

  const widthInterpolated = animatedPercent.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarTrack, { backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.progressBarFill,
          {
            width: widthInterpolated,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
};

interface ModelsViewProps {
  theme: Theme;
  activeModel: OnDeviceModel | null;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onSelectModel: (model: OnDeviceModel | null) => void;
  onBackToHome: () => void;
  onOpenChat: () => void;
}

type ModelCategory = 'all' | 'installed' | 'compact' | 'flagship' | 'reasoning';

export const ModelsView: React.FC<ModelsViewProps> = ({
  theme,
  activeModel,
  onSelectModel,
  onBackToHome,
  onOpenChat,
}) => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [installedIds, setInstalledIds] = useState<string[]>(() =>
    ModelStorage.getInstalledModelIds()
  );
  const [downloadProgressMap, setDownloadProgressMap] = useState<Record<string, DownloadProgress>>({});
  const [availableStorageGb, setAvailableStorageGb] = useState<number>(48.6);

  // Probe live device flash storage quota
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.quota) {
          setAvailableStorageGb(Number((est.quota / (1024 * 1024 * 1024)).toFixed(1)));
        }
      });
    }
  }, []);

  // Subscribe to installed models updates
  useEffect(() => {
    const unsub = ModelStorage.subscribeToInstalled((ids) => {
      setInstalledIds(ids);
    });
    return unsub;
  }, []);

  // Filter models
  const filteredModels = useMemo(() => {
    let list: ZayloModel[] = ZAYLO_MODELS;

    if (activeCategory === 'installed') {
      list = ZAYLO_MODELS.filter((m) => installedIds.includes(m.id));
    } else if (activeCategory === 'compact') {
      list = ZAYLO_MODELS.filter((m) => m.sizeMb < 1000);
    } else if (activeCategory === 'flagship') {
      list = ZAYLO_MODELS.filter((m) => m.sizeMb >= 1000);
    } else if (activeCategory === 'reasoning') {
      list = ZAYLO_MODELS.filter((m) =>
        m.capabilities.includes('REASONING') || m.capabilities.includes('CHAIN_OF_THOUGHT')
      );
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
  }, [activeCategory, searchQuery, installedIds]);

  const handleStartDownload = (model: ZayloModel) => {
    ModelStorage.startDownload(
      model,
      (progress) => {
        setDownloadProgressMap((prev) => ({
          ...prev,
          [model.id]: progress,
        }));
      },
      () => {
        // Download complete
        setDownloadProgressMap((prev) => {
          const next = { ...prev };
          delete next[model.id];
          return next;
        });
      }
    );
  };

  const handleCancelDownload = (modelId: string) => {
    ModelStorage.cancelDownload(modelId);
    setDownloadProgressMap((prev) => {
      const next = { ...prev };
      delete next[modelId];
      return next;
    });
  };

  const handleLoadModel = (model: ZayloModel) => {
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
      isDownloaded: true,
    };
    onSelectModel(converted);
  };

  const handleUnloadModel = () => {
    onSelectModel(null);
  };

  const handleDeleteModel = (modelId: string) => {
    if (activeModel?.id === modelId) {
      onSelectModel(null);
    }
    ModelStorage.deleteModel(modelId);
  };

  // Publisher styling
  const getPublisherColors = (publisher: string) => {
    switch (publisher.toLowerCase()) {
      case 'meta':
        return { bg: theme.pastels.blue.bg, text: theme.pastels.blue.text };
      case 'qwen':
        return { bg: theme.pastels.purple.bg, text: theme.pastels.purple.text };
      case 'microsoft':
        return { bg: theme.pastels.yellow.bg, text: theme.pastels.yellow.text };
      case 'mistral ai':
        return { bg: '#ffedd5', text: '#ea580c' };
      case 'deepseek':
        return { bg: '#e0e7ff', text: '#4338ca' };
      default:
        return { bg: theme.backgroundSecondary, text: theme.textSecondary };
    }
  };

  const totalInstalledSizeMb = useMemo(() => {
    return ZAYLO_MODELS
      .filter((m) => installedIds.includes(m.id))
      .reduce((acc, curr) => acc + curr.sizeMb, 0);
  }, [installedIds]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header */}
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

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Model Studio
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
            Certified On-Device SLM Library
          </Text>
        </View>

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

      {/* 2. Device Storage & Model Cache Summary Card */}
      <View
        style={[
          styles.storageCard,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          theme.shadows.sm,
        ]}
      >
        <View style={styles.storageCardTop}>
          <View style={styles.storageLeft}>
            <View style={[styles.storageIconBox, { backgroundColor: theme.pastels.blue.bg }]}>
              <Icon name="hard-drive" size={18} color={theme.pastels.blue.text} />
            </View>
            <View>
              <Text style={[styles.storageTitle, { color: theme.textPrimary }]}>
                Flash Storage Allocation
              </Text>
              <Text style={[styles.storageSubtitle, { color: theme.textMuted }]}>
                {installedIds.length} Installed ({totalInstalledSizeMb} MB) • {availableStorageGb} GB Available
              </Text>
            </View>
          </View>

          {activeModel && (
            <View style={[styles.activeModelChip, { backgroundColor: theme.successLight }]}>
              <View style={[styles.activeModelDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.activeModelChipText, { color: theme.success }]}>
                {activeModel.parameters} LOADED
              </Text>
            </View>
          )}
        </View>

        {/* Visual Flash Bar */}
        <SmoothProgressBar
          percent={Math.min(100, Math.max(8, Math.round((totalInstalledSizeMb / 8000) * 100)))}
          trackColor={theme.backgroundSecondary}
          fillColor={theme.pastels.blue.text}
        />
      </View>

      {/* 3. Search Bar */}
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
          placeholder="Search models by name, publisher, size..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Icon name="x" size={15} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* 4. Category Filter Chips */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {[
            { id: 'all', label: `All Models (${ZAYLO_MODELS.length})` },
            { id: 'installed', label: `Installed (${installedIds.length})` },
            { id: 'compact', label: 'Compact (< 1GB)' },
            { id: 'flagship', label: 'Flagship (3B+)' },
            { id: 'reasoning', label: 'Reasoning & CoT' },
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

      {/* 5. Models List */}
      <View style={styles.modelsList}>
        {filteredModels.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Icon name="layers" size={28} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Models Found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
              {activeCategory === 'installed'
                ? 'You have not downloaded any models yet. Switch to "All Models" to browse and download.'
                : 'No models match your search query.'}
            </Text>
          </View>
        ) : (
          filteredModels.map((model) => {
            const isDownloaded = installedIds.includes(model.id);
            const isSelected = activeModel?.id === model.id;
            const progress = downloadProgressMap[model.id];
            const isDownloading = !!progress && progress.status === 'downloading';
            const pubColors = getPublisherColors(model.publisher);

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
                {/* Card Top: Publisher chip, Name, Quantization */}
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <View style={[styles.pubChip, { backgroundColor: pubColors.bg }]}>
                        <Text style={[styles.pubChipText, { color: pubColors.text }]}>
                          {model.publisher}
                        </Text>
                      </View>
                      <Text style={[styles.modelName, { color: theme.textPrimary }]}>
                        {model.name}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.quantBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <Text style={[styles.quantBadgeText, { color: theme.textSecondary }]}>
                      {model.quantization}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={[styles.modelDesc, { color: theme.textSecondary }]}>
                  {model.description}
                </Text>

                {/* Specs Row */}
                <View style={[styles.specsRow, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
                  <View style={styles.specBox}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>FILE SIZE</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {model.sizeMb} MB
                    </Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>RAM REQUIRED</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      ~{(model.sizeMb * 1.3 / 1024).toFixed(1)} GB
                    </Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>CONTEXT</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {model.contextLength} ctx
                    </Text>
                  </View>
                  <View style={styles.specBox}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>PARAMS</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {model.parameterCount}
                    </Text>
                  </View>
                </View>

                {/* Active Downloading Progress Section */}
                {isDownloading && (
                  <View style={[styles.downloadingSection, { backgroundColor: theme.backgroundSecondary }]}>
                    <View style={styles.downloadProgressHeader}>
                      <Text style={[styles.downloadProgressText, { color: theme.textPrimary }]}>
                        Downloading weights: {progress.downloadedMb} / {progress.totalMb} MB ({progress.percent}%)
                      </Text>
                      <Text style={[styles.downloadSpeedText, { color: theme.accent }]}>
                        {progress.speedMbS} MB/s • {progress.etaSeconds}s left
                      </Text>
                    </View>

                    <SmoothProgressBar
                      percent={progress.percent}
                      trackColor={theme.cardBorder}
                      fillColor={theme.accent}
                    />

                    <TouchableOpacity
                      style={styles.cancelDownloadBtn}
                      onPress={() => handleCancelDownload(model.id)}
                      activeOpacity={0.7}
                    >
                      <Icon name="x" size={13} color={theme.danger} />
                      <Text style={[styles.cancelDownloadText, { color: theme.danger }]}>Cancel Download</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Footer Controls */}
                {!isDownloading && (
                  <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
                    {/* Left status / tags */}
                    <View style={styles.tagsRow}>
                      {isDownloaded ? (
                        <View style={[styles.downloadedStatusPill, { backgroundColor: theme.successLight }]}>
                          <Icon name="check" size={11} color={theme.success} />
                          <Text style={[styles.downloadedStatusText, { color: theme.success }]}>
                            Downloaded on Device
                          </Text>
                        </View>
                      ) : (
                        <View style={[styles.capChip, { backgroundColor: theme.backgroundSecondary }]}>
                          <Text style={[styles.capChipText, { color: theme.textMuted }]}>
                            {model.capabilities[0]}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Right action buttons */}
                    <View style={styles.actionButtonsRow}>
                      {isSelected ? (
                        <>
                          <TouchableOpacity
                            style={[
                              styles.loadButtonActive,
                              { backgroundColor: theme.successLight, borderColor: theme.success },
                            ]}
                            onPress={onOpenChat}
                            activeOpacity={0.8}
                          >
                            <Icon name="message-square" size={12} color={theme.success} />
                            <Text style={[styles.loadButtonText, { color: theme.success }]}>
                              Active • Chat
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.unloadButton, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={handleUnloadModel}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.unloadButtonText, { color: theme.textMuted }]}>
                              Unload
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : isDownloaded ? (
                        <>
                          <TouchableOpacity
                            style={[
                              styles.loadButton,
                              { backgroundColor: theme.floatingNav },
                              theme.shadows.sm,
                            ]}
                            onPress={() => handleLoadModel(model)}
                            activeOpacity={0.8}
                          >
                            <Icon name="play" size={12} color="#ffffff" />
                            <Text style={styles.loadButtonTextWhite}>Load into RAM</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.deleteButton, { backgroundColor: theme.backgroundSecondary }]}
                            onPress={() => handleDeleteModel(model.id)}
                            activeOpacity={0.7}
                          >
                            <Icon name="trash-2" size={13} color={theme.danger} />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.downloadButton,
                            { backgroundColor: theme.pastels.blue.text },
                            theme.shadows.sm,
                          ]}
                          onPress={() => handleStartDownload(model)}
                          activeOpacity={0.8}
                        >
                          <Icon name="download" size={13} color="#ffffff" />
                          <Text style={styles.downloadButtonText}>
                            Download ({model.sizeMb} MB)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
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
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
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
  storageCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  storageCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storageTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  storageSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  activeModelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeModelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeModelChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  storageBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  storageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  categoryPillActive: {},
  categoryPillInactive: {
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },
  modelsList: {
    gap: 16,
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  modelCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
  },
  modelCardSelected: {
    borderColor: '#0284c7',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  pubChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pubChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  quantBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quantBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  specBox: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  downloadingSection: {
    padding: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  downloadProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadProgressText: {
    fontSize: 11,
    fontWeight: '700',
  },
  downloadSpeedText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cancelDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  cancelDownloadText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  downloadedStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  capChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  loadButtonTextWhite: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  loadButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  loadButtonText: {
    fontSize: 11,
    fontWeight: '800',
  },
  unloadButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 14,
  },
  unloadButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
