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

type ModelTab = 'all' | 'installed' | 'small' | 'large';

export const ModelsView: React.FC<ModelsViewProps> = ({
  theme,
  activeModel,
  onSelectModel,
  onBackToHome,
  onOpenChat,
}) => {
  const [activeTab, setActiveTab] = useState<ModelTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModels = useMemo(() => {
    let list: ZayloModel[] = ZAYLO_MODELS;

    if (activeTab === 'installed') {
      list = ZAYLO_MODELS.filter((m) => m.isInstalled || m.id === activeModel.id);
    } else if (activeTab === 'small') {
      list = ZAYLO_MODELS.filter((m) => m.sizeMb < 1000);
    } else if (activeTab === 'large') {
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
  }, [activeTab, searchQuery, activeModel.id]);

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
      {/* 1. Header with Title & Back Navigation */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
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
          <View>
            <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>Model Studio</Text>
            <Text style={[styles.mainSubtitle, { color: theme.textMuted }]}>
              Zaylo Desktop Certified Model Catalog
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.chatShortcutBtn,
            { backgroundColor: theme.accent },
            theme.shadows.sm,
          ]}
          onPress={onOpenChat}
          activeOpacity={0.8}
        >
          <Icon name="message-square" size={14} color="#ffffff" />
          <Text style={styles.chatShortcutText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Top Filter Tabs */}
      <View
        style={[
          styles.tabsBar,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: 'all', label: 'All Models' },
            { id: 'installed', label: 'Ready / Installed' },
            { id: 'small', label: 'Compact (< 1GB)' },
            { id: 'large', label: 'High Capacity (3B+)' },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  isSelected && [
                    styles.tabButtonActive,
                    { backgroundColor: theme.card, borderColor: theme.cardBorder },
                    theme.shadows.sm,
                  ],
                ]}
                onPress={() => setActiveTab(tab.id as ModelTab)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    {
                      color: isSelected ? theme.textPrimary : theme.textMuted,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          placeholder="Search models, publishers, architectures..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* 4. Models List */}
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
              {/* Card Header */}
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
                  <Text style={[styles.specLabel, { color: theme.textMuted }]}>FILE SIZE</Text>
                  <Text style={[styles.specVal, { color: theme.textPrimary }]}>{model.sizeMb} MB</Text>
                </View>
                <View style={styles.specBox}>
                  <Text style={[styles.specLabel, { color: theme.textMuted }]}>CONTEXT</Text>
                  <Text style={[styles.specVal, { color: theme.textPrimary }]}>{model.contextLength} tokens</Text>
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
                      { backgroundColor: theme.accent },
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 18,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  mainSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  chatShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chatShortcutText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsBar: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    marginBottom: 12,
  },
  tabsScroll: {
    flexDirection: 'row',
    gap: 4,
  },
  tabButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
  },
  tabButtonActive: {
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  modelsList: {
    gap: 12,
  },
  modelCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
    fontSize: 15,
    fontWeight: '800',
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
    fontSize: 11,
    marginTop: 2,
  },
  formatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formatBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  capChipText: {
    fontSize: 9,
    fontWeight: '700',
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
  },
  loadButtonActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9,
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
