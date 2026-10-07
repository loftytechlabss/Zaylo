import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Switch,
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
  activeLocalModel: OnDeviceModel | null;
  pagingConfig: MemoryPagingConfig;
  profile: DeviceMemoryProfile;
  onOpenChat: (initialPrompt?: string) => void;
  onOpenModelModal: () => void;
  onOpenPairingModal: () => void;
  onOpenMemoryModal: () => void;
  onToggleTheme: () => void;
}

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

  // Local switch states matching reference UI
  const [localEngineEnabled, setLocalEngineEnabled] = useState(!!activeLocalModel);
  const [desktopSyncEnabled, setDesktopSyncEnabled] = useState(desktopHost.isConnected);
  const [autoOffloadEnabled, setAutoOffloadEnabled] = useState(true);
  const [telemetryEnabled, setTelemetryEnabled] = useState(true);

  const handleToggleLocalSwitch = (val: boolean) => {
    setLocalEngineEnabled(val);
    if (val) {
      if (activeLocalModel) {
        onToggleMode('on_device');
      } else {
        onOpenModelModal();
      }
    }
  };

  const handleToggleDesktopSwitch = (val: boolean) => {
    setDesktopSyncEnabled(val);
    if (val) {
      onToggleMode('desktop');
      if (!desktopHost.isConnected) onOpenPairingModal();
    } else {
      onToggleMode('on_device');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header: Clean title with Zaylo logo toggle */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.welcomeGreeting, { color: theme.textSecondary }]}>
            Welcome to
          </Text>
          <Text style={[styles.welcomeName, { color: theme.textPrimary }]}>
            Zaylo Studio
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.avatarButton,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              theme.shadows.sm,
            ]}
            onPress={onToggleTheme}
            activeOpacity={0.8}
          >
            <ZLogo size={24} variant={theme.isDark ? 'white' : 'dark'} />
            <View
              style={[
                styles.avatarDot,
                { backgroundColor: theme.success },
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Smart Systems: 2x2 Pastel Cards Grid with Toggles (Matching Reference UI) */}
      <View style={styles.systemsSection}>
        <Text style={[styles.sectionTitleLabel, { color: theme.textMuted }]}>
          Inference Systems
        </Text>

        <View style={styles.systemsGrid}>
          {/* Card 1: Local Engine (Soft Sky Blue) */}
          <View
            style={[
              styles.pastelCard,
              {
                backgroundColor: theme.pastels.blue.bg,
                borderColor: theme.pastels.blue.border,
              },
              theme.shadows.sm,
            ]}
          >
            <View style={styles.pastelCardTop}>
              <View
                style={[
                  styles.geometricIconBox,
                  { backgroundColor: theme.pastels.blue.iconBg },
                ]}
              >
                <Icon name="cpu" size={20} color="#ffffff" />
              </View>
              <Switch
                value={localEngineEnabled && !!activeLocalModel}
                disabled={!activeLocalModel}
                onValueChange={handleToggleLocalSwitch}
                trackColor={{ false: '#cbd5e1', true: theme.pastels.blue.text }}
                thumbColor="#ffffff"
                ios_backgroundColor="#cbd5e1"
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                onToggleMode('on_device');
                onOpenModelModal();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.pastelCardTitle, { color: theme.textPrimary }]}>
                Local LLM
              </Text>
              <Text
                style={[
                  styles.pastelCardSubtitle,
                  { color: activeLocalModel ? theme.pastels.blue.text : theme.textMuted },
                ]}
                numberOfLines={1}
              >
                {activeLocalModel ? activeLocalModel.name : 'No Model Loaded • Tap to Select'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 2: Desktop Gateway (Soft Lavender / Purple) */}
          <View
            style={[
              styles.pastelCard,
              {
                backgroundColor: theme.pastels.purple.bg,
                borderColor: theme.pastels.purple.border,
              },
              theme.shadows.sm,
            ]}
          >
            <View style={styles.pastelCardTop}>
              <View
                style={[
                  styles.geometricIconBox,
                  { backgroundColor: theme.pastels.purple.iconBg },
                ]}
              >
                <Icon name="monitor" size={20} color="#ffffff" />
              </View>
              <Switch
                value={desktopSyncEnabled}
                onValueChange={handleToggleDesktopSwitch}
                trackColor={{ false: '#cbd5e1', true: theme.pastels.purple.text }}
                thumbColor="#ffffff"
                ios_backgroundColor="#cbd5e1"
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                onToggleMode('desktop');
                onOpenPairingModal();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.pastelCardTitle, { color: theme.textPrimary }]}>
                Desktop Host
              </Text>
              <Text style={[styles.pastelCardSubtitle, { color: theme.pastels.purple.text }]}>
                {desktopHost.isConnected ? 'Port :8080 Active' : 'Tap to Pair Host'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 3: Model Studio (Soft Golden Amber) */}
          <View
            style={[
              styles.pastelCard,
              {
                backgroundColor: theme.pastels.yellow.bg,
                borderColor: theme.pastels.yellow.border,
              },
              theme.shadows.sm,
            ]}
          >
            <View style={styles.pastelCardTop}>
              <View
                style={[
                  styles.geometricIconBox,
                  { backgroundColor: theme.pastels.yellow.iconBg },
                ]}
              >
                <Icon name="layers" size={20} color="#ffffff" />
              </View>
              <Switch
                value={autoOffloadEnabled}
                onValueChange={setAutoOffloadEnabled}
                trackColor={{ false: '#cbd5e1', true: theme.pastels.yellow.text }}
                thumbColor="#ffffff"
                ios_backgroundColor="#cbd5e1"
              />
            </View>

            <TouchableOpacity onPress={onOpenModelModal} activeOpacity={0.7}>
              <Text style={[styles.pastelCardTitle, { color: theme.textPrimary }]}>
                Model Library
              </Text>
              <Text style={[styles.pastelCardSubtitle, { color: theme.pastels.yellow.text }]}>
                7 Certified GGUFs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Card 4: Hardware Telemetry (Soft Mint Green) */}
          <View
            style={[
              styles.pastelCard,
              {
                backgroundColor: theme.pastels.green.bg,
                borderColor: theme.pastels.green.border,
              },
              theme.shadows.sm,
            ]}
          >
            <View style={styles.pastelCardTop}>
              <View
                style={[
                  styles.geometricIconBox,
                  { backgroundColor: theme.pastels.green.iconBg },
                ]}
              >
                <Icon name="activity" size={20} color="#ffffff" />
              </View>
              <Switch
                value={telemetryEnabled}
                onValueChange={setTelemetryEnabled}
                trackColor={{ false: '#cbd5e1', true: theme.pastels.green.text }}
                thumbColor="#ffffff"
                ios_backgroundColor="#cbd5e1"
              />
            </View>

            <TouchableOpacity onPress={onOpenMemoryModal} activeOpacity={0.7}>
              <Text style={[styles.pastelCardTitle, { color: theme.textPrimary }]}>
                Telemetry & IP
              </Text>
              <Text style={[styles.pastelCardSubtitle, { color: theme.pastels.green.text }]}>
                LAN Node Ready
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. Primary Chat Launch Banner (Matching Middle Screen "Start ->" Hero) */}
      <TouchableOpacity
        style={[
          styles.startHeroBanner,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.md,
        ]}
        onPress={() => onOpenChat()}
        activeOpacity={0.85}
      >
        <View style={styles.startHeroLeft}>
          <Text style={[styles.startHeroTitle, { color: theme.textPrimary }]}>
            Start New Session
          </Text>
          <Text style={[styles.startHeroDesc, { color: theme.textMuted }]}>
            {isDesktop
              ? 'Streaming from Zaylo Desktop gateway'
              : 'Zero-cloud execution on local hardware'}
          </Text>
        </View>

        <View
          style={[
            styles.startCircleBtn,
            { backgroundColor: theme.floatingNav },
            theme.shadows.md,
          ]}
        >
          <Text style={styles.startCircleText}>Start</Text>
          <Icon name="arrow-right" size={14} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* 5. Clean Quick Tasks */}
      <View style={styles.tasksSection}>
        <Text style={[styles.sectionTitleLabel, { color: theme.textMuted }]}>
          Quick Tasks
        </Text>

        <View style={styles.tasksList}>
          {[
            {
              title: 'Explain Quantum Computing',
              desc: 'High-level architectural overview and qubits breakdown',
              icon: 'zap',
              color: theme.pastels.blue.text,
              bg: theme.pastels.blue.bg,
            },
            {
              title: 'Write a TypeScript API Route',
              desc: 'Fastify endpoint with schema validation and error handler',
              icon: 'code',
              color: theme.pastels.purple.text,
              bg: theme.pastels.purple.bg,
            },
            {
              title: 'Review System Architecture',
              desc: 'Trade-offs between on-device SLMs and centralized clusters',
              icon: 'file-text',
              color: theme.pastels.yellow.text,
              bg: theme.pastels.yellow.bg,
            },
          ].map((task, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.taskCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadows.sm,
              ]}
              onPress={() => onOpenChat(task.title)}
              activeOpacity={0.7}
            >
              <View style={[styles.taskIconBox, { backgroundColor: task.bg }]}>
                <Icon name={task.icon} size={16} color={task.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>
                  {task.title}
                </Text>
                <Text style={[styles.taskDesc, { color: theme.textMuted }]}>
                  {task.desc}
                </Text>
              </View>
              <Icon name="chevron-right" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
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
    paddingTop: Platform.OS === 'ios' ? 16 : 22,
    paddingBottom: 110, // Generous padding so floating island nav doesn't cover content
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeGreeting: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  welcomeName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    position: 'absolute',
    top: 3,
    right: 3,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionTitleLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  systemsSection: {
    marginBottom: 24,
  },
  systemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  pastelCard: {
    width: '47.8%',
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  pastelCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  geometricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  pastelCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  pastelCardSubtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  startHeroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    marginBottom: 26,
  },
  startHeroLeft: {
    flex: 1,
    marginRight: 14,
  },
  startHeroTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  startHeroDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  startCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
  },
  startCircleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  tasksSection: {
    marginBottom: 16,
  },
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  taskIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  taskDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
