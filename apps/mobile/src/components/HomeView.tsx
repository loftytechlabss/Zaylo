import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type {
  HybridMode,
  DesktopHost,
  OnDeviceModel,
  MemoryPagingConfig,
  DeviceMemoryProfile,
} from '../types';

interface HomeViewProps {
  theme: Theme;
  mode: HybridMode;
  onToggleMode: (newMode: HybridMode) => void;
  desktopHost: DesktopHost;
  activeLocalModel: OnDeviceModel;
  pagingConfig: MemoryPagingConfig;
  profile: DeviceMemoryProfile;
  onOpenChat: (initialPrompt?: string) => void;
  onOpenModelModal: () => void;
  onOpenPairingModal: () => void;
  onOpenMemoryModal: () => void;
  onToggleTheme: () => void;
}

const FEATURE_PROMPTS = [
  {
    icon: '⚡',
    title: 'Code Refactor',
    desc: 'Write an async LRU cache in TypeScript with tests',
    tag: 'Coding',
  },
  {
    icon: '🔒',
    title: 'Privacy Audit',
    desc: 'Explain how local kernel virtual memory paging works',
    tag: 'Security',
  },
  {
    icon: '📄',
    title: 'Document Analysis',
    desc: 'Summarize the differences between LoRA and QLoRA',
    tag: 'Analysis',
  },
  {
    icon: '🧪',
    title: 'Speed Benchmark',
    desc: 'Benchmark tokens per second on Apple Neural Engine',
    tag: 'Telemetry',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  theme,
  mode,
  onToggleMode,
  desktopHost,
  activeLocalModel,
  pagingConfig,
  profile,
  onOpenChat,
  onOpenModelModal,
  onOpenPairingModal,
  onOpenMemoryModal,
  onToggleTheme,
}) => {
  const isDesktop = mode === 'desktop';
  const memoryPct = Math.min(
    100,
    Math.round((pagingConfig.estimatedFootprintMb / (profile.availableRamMb || 2048)) * 100)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header with Brand, Status Pill & Theme Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.brandGroup}>
          <View style={[styles.brandIconBox, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.brandIconText, { color: theme.accent }]}>Z</Text>
          </View>
          <View>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>ZAYLO</Text>
              <View style={[styles.proBadge, { backgroundColor: theme.cardElevated, borderColor: theme.cardBorder }]}>
                <Text style={[styles.proBadgeText, { color: theme.cyan }]}>MOBILE</Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              Local Neural Inference
            </Text>
          </View>
        </View>

        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onToggleTheme}
          activeOpacity={0.7}
        >
          <Text style={styles.themeButtonIcon}>{theme.isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Hero Engine Status Card */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.md,
        ]}
      >
        <View style={styles.heroTopRow}>
          <Text style={[styles.sectionOverline, { color: theme.textMuted }]}>
            ACTIVE INFERENCE RUNTIME
          </Text>
          <View
            style={[
              styles.liveIndicator,
              {
                backgroundColor: isDesktop
                  ? desktopHost.isConnected
                    ? theme.successLight
                    : 'rgba(239, 68, 68, 0.12)'
                  : theme.cyanLight,
              },
            ]}
          >
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: isDesktop
                    ? desktopHost.isConnected
                      ? theme.success
                      : theme.danger
                    : theme.cyan,
                },
              ]}
            />
            <Text
              style={[
                styles.liveText,
                {
                  color: isDesktop
                    ? desktopHost.isConnected
                      ? theme.success
                      : theme.danger
                    : theme.cyan,
                },
              ]}
            >
              {isDesktop
                ? desktopHost.isConnected
                  ? 'Desktop Paired'
                  : 'Host Offline'
                : 'On-Device ANE'}
            </Text>
          </View>
        </View>

        {/* Segmented Mode Switcher */}
        <View style={[styles.modeSwitcher, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.modeTab,
              !isDesktop && [styles.modeTabActive, { backgroundColor: theme.card }, theme.shadows.sm],
            ]}
            onPress={() => onToggleMode('on_device')}
            activeOpacity={0.8}
          >
            <Text style={styles.modeTabIcon}>⚡</Text>
            <Text
              style={[
                styles.modeTabLabel,
                { color: !isDesktop ? theme.textPrimary : theme.textMuted },
              ]}
            >
              On-Device
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              isDesktop && [styles.modeTabActive, { backgroundColor: theme.card }, theme.shadows.sm],
            ]}
            onPress={() => onToggleMode('desktop')}
            activeOpacity={0.8}
          >
            <Text style={styles.modeTabIcon}>🖥️</Text>
            <Text
              style={[
                styles.modeTabLabel,
                { color: isDesktop ? theme.textPrimary : theme.textMuted },
              ]}
            >
              Desktop Host
            </Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry info row */}
        <View style={[styles.telemetryBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
          <View style={styles.telemetryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.telemetryLabel, { color: theme.textMuted }]}>
                {isDesktop ? 'HOST / MODEL' : 'ACTIVE MODEL'}
              </Text>
              <Text style={[styles.telemetryValue, { color: theme.textPrimary }]} numberOfLines={1}>
                {isDesktop
                  ? desktopHost.isConnected
                    ? desktopHost.activeModelName || 'Desktop Model'
                    : 'Tap to connect host'
                  : activeLocalModel.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={isDesktop ? onOpenPairingModal : onOpenModelModal}
              style={[styles.chipButton, { backgroundColor: theme.accentLight, borderColor: theme.accent }]}
            >
              <Text style={[styles.chipButtonText, { color: theme.accent }]}>
                {isDesktop ? 'Config Host' : 'Change'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress / Memory bar for on-device */}
          {!isDesktop && (
            <View style={styles.memoryBarContainer}>
              <View style={styles.memoryBarHeader}>
                <Text style={[styles.memoryBarLabel, { color: theme.textMuted }]}>
                  Paged Memory Footprint
                </Text>
                <Text style={[styles.memoryBarValue, { color: theme.cyan }]}>
                  {pagingConfig.estimatedFootprintMb} MB / {profile.availableRamMb} MB ({memoryPct}%)
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: theme.cardBorder }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, Math.max(8, memoryPct))}%`,
                      backgroundColor: theme.cyan,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 3. Primary Prompt Action Launcher */}
      <TouchableOpacity
        style={[
          styles.promptLauncher,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.md,
        ]}
        onPress={() => onOpenChat()}
        activeOpacity={0.8}
      >
        <View style={styles.promptLauncherLeft}>
          <View style={[styles.promptLauncherIcon, { backgroundColor: theme.accentLight }]}>
            <Text style={{ fontSize: 18 }}>💬</Text>
          </View>
          <View>
            <Text style={[styles.promptLauncherTitle, { color: theme.textPrimary }]}>
              Start New Chat
            </Text>
            <Text style={[styles.promptLauncherSubtitle, { color: theme.textMuted }]}>
              Ask anything locally with zero cloud delay...
            </Text>
          </View>
        </View>
        <View style={[styles.promptLauncherArrow, { backgroundColor: theme.accent }]}>
          <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>→</Text>
        </View>
      </TouchableOpacity>

      {/* 4. Core Capabilities 4-Grid */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Core Capabilities</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Zero-cloud private tools
        </Text>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadows.sm]}
          onPress={() => onOpenChat()}
          activeOpacity={0.7}
        >
          <View style={[styles.gridIconCircle, { backgroundColor: theme.accentLight }]}>
            <Text style={styles.gridIconText}>💬</Text>
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>Chat Studio</Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Full conversation with kernel memory paging
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadows.sm]}
          onPress={onOpenModelModal}
          activeOpacity={0.7}
        >
          <View style={[styles.gridIconCircle, { backgroundColor: theme.cyanLight }]}>
            <Text style={styles.gridIconText}>🧠</Text>
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>Model Studio</Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Switch SLMs: Llama-3.2, Qwen-2.5, DeepSeek
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadows.sm]}
          onPress={onOpenPairingModal}
          activeOpacity={0.7}
        >
          <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
            <Text style={styles.gridIconText}>🖥️</Text>
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>Desktop Sync</Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Pair Zaylo Desktop Host over local Wi-Fi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }, theme.shadows.sm]}
          onPress={onOpenMemoryModal}
          activeOpacity={0.7}
        >
          <View style={[styles.gridIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.14)' }]}>
            <Text style={styles.gridIconText}>📊</Text>
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>RAM Gauge</Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Virtual memory chunking and health metrics
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Suggested Prompts List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Instant Prompts</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Tap any card to launch immediately
        </Text>
      </View>

      <View style={styles.promptsContainer}>
        {FEATURE_PROMPTS.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.promptCard,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.shadows.sm,
            ]}
            onPress={() => onOpenChat(p.desc)}
            activeOpacity={0.7}
          >
            <View style={styles.promptCardHeader}>
              <View style={styles.promptIconRow}>
                <Text style={styles.promptIcon}>{p.icon}</Text>
                <Text style={[styles.promptTitle, { color: theme.textPrimary }]}>{p.title}</Text>
              </View>
              <View style={[styles.promptTag, { backgroundColor: theme.backgroundSecondary }]}>
                <Text style={[styles.promptTagText, { color: theme.textSecondary }]}>{p.tag}</Text>
              </View>
            </View>
            <Text style={[styles.promptDesc, { color: theme.textSecondary }]}>{p.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 6. Air-Gapped Privacy Footer Badge */}
      <View style={[styles.privacyCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>
            100% Zero-Cloud Private AI
          </Text>
          <Text style={[styles.privacyDesc, { color: theme.textMuted }]}>
            All prompts and weights remain strictly on your device and local LAN.
          </Text>
        </View>
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
    paddingTop: Platform.OS === 'ios' ? 16 : 24,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeButtonIcon: {
    fontSize: 18,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  modeTabActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeTabIcon: {
    fontSize: 14,
  },
  modeTabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  telemetryBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  telemetryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  telemetryValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  chipButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memoryBarContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  memoryBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  memoryBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  memoryBarValue: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  promptLauncher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  promptLauncherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  promptLauncherIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptLauncherTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  promptLauncherSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  promptLauncherArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  gridIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridIconText: {
    fontSize: 18,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  gridDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  promptsContainer: {
    gap: 10,
    marginBottom: 24,
  },
  promptCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  promptIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  promptIcon: {
    fontSize: 16,
  },
  promptTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  promptTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  promptTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  promptDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  privacyIcon: {
    fontSize: 22,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  privacyDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
});
