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
import { ZLogo } from './common/ZLogo';
import { Icon } from './common/Icon';

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

const QUICK_ACTIONS = [
  {
    iconName: 'code',
    title: 'Code Generation',
    desc: 'Write clean algorithms, handlers, or unit tests',
    prompt: 'Write an asynchronous LRU Cache in TypeScript with full type safety and comments.',
  },
  {
    iconName: 'file-text',
    title: 'Technical Summary',
    desc: 'Analyze documentation and architectural trade-offs',
    prompt: 'Summarize the key differences between LoRA and QLoRA fine-tuning methods.',
  },
  {
    iconName: 'terminal',
    title: 'System Debugging',
    desc: 'Inspect error logs and resolve runtime exceptions',
    prompt: 'Help me debug a network connection timeout issue in a Node.js client.',
  },
  {
    iconName: 'help-circle',
    title: 'Concept Breakdown',
    desc: 'Explain advanced algorithms in simple terms',
    prompt: 'Explain how vector embeddings and cosine similarity search work.',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  theme,
  mode,
  onToggleMode,
  desktopHost,
  activeLocalModel,
  onOpenChat,
  onOpenModelModal,
  onOpenPairingModal,
  onOpenMemoryModal,
  onToggleTheme,
}) => {
  const isDesktop = mode === 'desktop';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header with Official Geometric Z Logo & Theme Switcher */}
      <View style={styles.headerRow}>
        <View style={styles.brandGroup}>
          <ZLogo
            size={30}
            variant={theme.isDark ? 'white' : 'dark'}
            withContainer
            containerBg={theme.isDark ? '#1a1d26' : '#f1f5f9'}
            containerStyle={{
              borderWidth: 1,
              borderColor: theme.cardBorder,
            }}
          />
          <View style={styles.brandTextContainer}>
            <View style={styles.brandTitleRow}>
              <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>ZAYLO</Text>
              <View
                style={[
                  styles.brandPill,
                  {
                    backgroundColor: theme.accentLight,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Text style={[styles.brandPillText, { color: theme.accent }]}>AI STUDIO</Text>
              </View>
            </View>
            <Text style={[styles.brandSubtitle, { color: theme.textMuted }]}>
              Local Inference & Desktop Server
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.themeButton,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onToggleTheme}
          activeOpacity={0.7}
        >
          <Icon
            name={theme.isDark ? 'sun' : 'moon'}
            size={18}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      {/* 2. Zaylo Overview Dashboard Card (Desktop Style) */}
      <View
        style={[
          styles.overviewCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.sm,
        ]}
      >
        {/* Runtime Header */}
        <View style={styles.overviewTopRow}>
          <View>
            <Text style={[styles.sectionOverline, { color: theme.textMuted }]}>
              INFERENCE RUNTIME
            </Text>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              {isDesktop ? 'Zaylo Desktop Server' : 'Local Inference Engine'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isDesktop
                  ? desktopHost.isConnected
                    ? theme.successLight
                    : 'rgba(239, 68, 68, 0.1)'
                  : theme.successLight,
                borderColor: isDesktop
                  ? desktopHost.isConnected
                    ? theme.success
                    : theme.danger
                  : theme.success,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isDesktop
                    ? desktopHost.isConnected
                      ? theme.success
                      : theme.danger
                    : theme.success,
                },
              ]}
            />
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: isDesktop
                    ? desktopHost.isConnected
                      ? theme.success
                      : theme.danger
                    : theme.success,
                },
              ]}
            >
              {isDesktop
                ? desktopHost.isConnected
                  ? 'Connected'
                  : 'Host Offline'
                : 'Online'}
            </Text>
          </View>
        </View>

        {/* Runtime Mode Switcher */}
        <View
          style={[
            styles.modeSwitcher,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.modeTab,
              !isDesktop && [
                styles.modeTabActive,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadows.sm,
              ],
            ]}
            onPress={() => onToggleMode('on_device')}
            activeOpacity={0.8}
          >
            <Icon
              name="cpu"
              size={15}
              color={!isDesktop ? theme.accent : theme.textMuted}
            />
            <Text
              style={[
                styles.modeTabLabel,
                { color: !isDesktop ? theme.textPrimary : theme.textMuted },
              ]}
            >
              On-Device Model
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              isDesktop && [
                styles.modeTabActive,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadows.sm,
              ],
            ]}
            onPress={() => onToggleMode('desktop')}
            activeOpacity={0.8}
          >
            <Icon
              name="monitor"
              size={15}
              color={isDesktop ? theme.accent : theme.textMuted}
            />
            <Text
              style={[
                styles.modeTabLabel,
                { color: isDesktop ? theme.textPrimary : theme.textMuted },
              ]}
            >
              Desktop Host :8080
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loaded Model Info Block */}
        <View
          style={[
            styles.loadedModelBlock,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.loadedModelRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.loadedModelLabel, { color: theme.textMuted }]}>
                {isDesktop ? 'DESKTOP MODEL' : 'ACTIVE MODEL'}
              </Text>
              <Text
                style={[styles.loadedModelName, { color: theme.textPrimary }]}
                numberOfLines={1}
              >
                {isDesktop
                  ? desktopHost.isConnected
                    ? desktopHost.activeModelName || 'Desktop Model'
                    : 'Pair Zaylo Desktop Host'
                  : activeLocalModel.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={isDesktop ? onOpenPairingModal : onOpenModelModal}
              style={[
                styles.changeModelBtn,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadows.sm,
              ]}
              activeOpacity={0.7}
            >
              <Text style={[styles.changeModelBtnText, { color: theme.accent }]}>
                {isDesktop ? 'Configure Host' : 'Change Model'}
              </Text>
              <Icon name="chevron-right" size={13} color={theme.accent} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. Primary Prompt Action Launcher */}
      <TouchableOpacity
        style={[
          styles.startChatBanner,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.sm,
        ]}
        onPress={() => onOpenChat()}
        activeOpacity={0.85}
      >
        <View style={styles.startChatLeft}>
          <View
            style={[
              styles.startChatIconBox,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Icon name="message-square" size={19} color={theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.startChatTitle, { color: theme.textPrimary }]}>
              Start New Conversation
            </Text>
            <Text style={[styles.startChatSubtitle, { color: theme.textMuted }]}>
              Run prompts locally or stream from Desktop server
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.startChatArrow,
            { backgroundColor: theme.accent },
          ]}
        >
          <Icon name="arrow-right" size={16} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* 4. Core Workspaces 4-Grid */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Workspaces
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Local developer tools
        </Text>
      </View>

      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[
            styles.gridCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={() => onOpenChat()}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.gridIconCircle,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Icon name="message-square" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>
            Chat Studio
          </Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Interactive chat with active LLM weights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.gridCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onOpenModelModal}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.gridIconCircle,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Icon name="cpu" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>
            Model Studio
          </Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Browse Llama, Qwen, Mistral & DeepSeek
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.gridCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onOpenPairingModal}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.gridIconCircle,
              { backgroundColor: theme.successLight },
            ]}
          >
            <Icon name="monitor" size={18} color={theme.success} />
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>
            Desktop Gateway
          </Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Pair with Fastify Host on local Wi-Fi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.gridCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onOpenMemoryModal}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.gridIconCircle,
              { backgroundColor: theme.accentLight },
            ]}
          >
            <Icon name="activity" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>
            Telemetry & Info
          </Text>
          <Text style={[styles.gridDesc, { color: theme.textMuted }]}>
            Client runtime specs & connection health
          </Text>
        </TouchableOpacity>
      </View>

      {/* 5. Prompt Starters */}
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Prompt Starters
        </Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          Tap any card to launch immediately
        </Text>
      </View>

      <View style={styles.promptsList}>
        {QUICK_ACTIONS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.promptCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
              theme.shadows.sm,
            ]}
            onPress={() => onOpenChat(item.prompt)}
            activeOpacity={0.7}
          >
            <View style={styles.promptCardTop}>
              <View style={styles.promptIconTitle}>
                <View
                  style={[
                    styles.promptIconBox,
                    { backgroundColor: theme.accentLight },
                  ]}
                >
                  <Icon name={item.iconName} size={15} color={theme.accent} />
                </View>
                <Text style={[styles.promptTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
              </View>
            </View>
            <Text style={[styles.promptDesc, { color: theme.textSecondary }]}>
              {item.desc}
            </Text>
          </TouchableOpacity>
        ))}
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
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandTextContainer: {
    gap: 2,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  overviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  sectionOverline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
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
  },
  modeTabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadedModelBlock: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  loadedModelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadedModelLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  loadedModelName: {
    fontSize: 13,
    fontWeight: '700',
  },
  changeModelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  changeModelBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  startChatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  startChatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  startChatIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startChatTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  startChatSubtitle: {
    fontSize: 11,
  },
  startChatArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  gridIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  gridDesc: {
    fontSize: 10,
    lineHeight: 14,
  },
  promptsList: {
    gap: 8,
    marginBottom: 18,
  },
  promptCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  promptCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  promptIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  promptDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
