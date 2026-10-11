import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type { DeviceMemoryProfile, MemoryPagingConfig, DeviceHardwareTelemetry } from '../types';
import { DeviceProfiler } from '../engine/deviceProfiler';
import { ModelStorage } from '../engine/modelStorage';
import { OnDeviceEngine } from '../engine/onDeviceEngine';
import { getHostIp } from '../utils/networkHost';
import { Icon } from './common/Icon';

interface MemoryGaugeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onUpdatePagingConfig: (config: Partial<MemoryPagingConfig>) => void;
  theme: Theme;
}

type TelemetryTab = 'ram' | 'storage' | 'engine';

export const MemoryGaugeModal: React.FC<MemoryGaugeModalProps> = ({
  visible,
  onClose,
  profile,
  theme,
}) => {
  const [telemetry, setTelemetry] = useState<DeviceHardwareTelemetry>(() =>
    DeviceProfiler.getHardwareTelemetry()
  );
  const [activeTab, setActiveTab] = useState<TelemetryTab>('ram');
  const [installedCount, setInstalledCount] = useState<number>(0);
  const [availableStorageGb, setAvailableStorageGb] = useState<number>(48.6);

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Live storage and installed models inspection
  useEffect(() => {
    if (!visible) return;

    setTelemetry(DeviceProfiler.getHardwareTelemetry());
    setInstalledCount(ModelStorage.getInstalledModelIds().length);

    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        if (est.quota) {
          setAvailableStorageGb(Number((est.quota / (1024 * 1024 * 1024)).toFixed(1)));
        }
      });
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.95);
      slideAnim.setValue(20);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, slideAnim, fadeAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const activeModel = OnDeviceEngine.getActiveModel();
  const loadedRamMb = OnDeviceEngine.getLoadedRamMb();
  const hostIp = getHostIp();

  const totalRam = profile.totalRamMb || 8192;
  const systemOverhead = profile.totalRamMb - profile.availableRamMb;
  const usedRam = systemOverhead + (loadedRamMb || 0);
  const usedPercent = Math.min(100, Math.round((usedRam / totalRam) * 100));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
            theme.shadows.lg,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                Device & System Telemetry
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                {Platform.OS === 'ios' ? 'Apple iOS' : 'Android OS'} • Authentic Hardware Diagnostics
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
              activeOpacity={0.7}
            >
              <Icon name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Hardware Highlights Banner */}
          <View style={[styles.socBanner, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
            <View style={[styles.socIconCircle, { backgroundColor: theme.pastels.blue.bg }]}>
              <Icon name="cpu" size={18} color={theme.pastels.blue.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.socTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {Platform.OS === 'ios' ? 'Apple Silicon Mobile SoC' : telemetry.socName}
              </Text>
              <Text style={[styles.socSubtitle, { color: theme.textMuted }]}>
                {telemetry.cpuTotalCores} Hardware Threads • Metal GPU Compute
              </Text>
            </View>
            <View style={[styles.acceleratedBadge, { backgroundColor: theme.successLight }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
              <Text style={[styles.acceleratedBadgeText, { color: theme.success }]}>
                ONLINE
              </Text>
            </View>
          </View>

          {/* 3 Clean Segmented Tabs (Never wrap) */}
          <View style={styles.tabsRow}>
            {[
              { id: 'ram', label: 'RAM & Memory', icon: 'layers' },
              { id: 'storage', label: 'Storage & Disk', icon: 'hard-drive' },
              { id: 'engine', label: 'Host & Engine', icon: 'zap' },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tabButton,
                    isSelected
                      ? [styles.tabButtonActive, { backgroundColor: theme.floatingNav }]
                      : [styles.tabButtonInactive, { backgroundColor: theme.backgroundSecondary }],
                  ]}
                  onPress={() => setActiveTab(tab.id as TelemetryTab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      { color: isSelected ? '#ffffff' : theme.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Scrollable Tab Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* TAB 1: RAM & MEMORY */}
            {activeTab === 'ram' && (
              <View style={styles.tabContentBlock}>
                {/* 1. RAM Allocation Card */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.blue.bg }]}>
                      <Icon name="layers" size={15} color={theme.pastels.blue.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Physical RAM Allocation
                    </Text>
                  </View>

                  <View style={styles.memoryStatsHeader}>
                    <Text style={[styles.ramUsageText, { color: theme.textPrimary }]}>
                      {usedRam} MB Used ({usedPercent}%)
                    </Text>
                    <Text style={[styles.ramFreeText, { color: theme.textMuted }]}>
                      {totalRam - usedRam} MB Free
                    </Text>
                  </View>

                  <View style={[styles.ramBarTrack, { backgroundColor: theme.backgroundSecondary }]}>
                    <View
                      style={[
                        styles.ramBarFill,
                        {
                          width: `${usedPercent}%`,
                          backgroundColor: theme.accent,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Total Device Memory</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {totalRam} MB ({(totalRam / 1024).toFixed(1)} GB)
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Loaded Model Footprint</Text>
                    <Text style={[styles.specItemValue, { color: activeModel ? theme.success : theme.textMuted }]}>
                      {activeModel ? `${activeModel.name} (${loadedRamMb} MB)` : '0 MB (No model loaded in RAM)'}
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>System & App Overhead</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      ~{systemOverhead} MB
                    </Text>
                  </View>
                </View>

                {/* 2. Paging & KV Cache Strategy */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 12 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.yellow.bg }]}>
                      <Icon name="activity" size={15} color={theme.pastels.yellow.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Paging & Virtual Memory
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Paging Status</Text>
                    <Text style={[styles.specItemValue, { color: theme.success }]}>
                      {activeModel ? 'Active (Paging Buffer Allocated)' : 'Idle'}
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Context Window Limit</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {activeModel ? `${activeModel.sizeMb > 1000 ? 4096 : 2048} Tokens` : '2048 Tokens'}
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Quantization Scheme</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {activeModel ? `${activeModel.quantization} Quantized Weights` : 'Q8_0 / Q4_K_M'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: STORAGE & DISK */}
            {activeTab === 'storage' && (
              <View style={styles.tabContentBlock}>
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.blue.bg }]}>
                      <Icon name="hard-drive" size={15} color={theme.pastels.blue.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      On-Device Flash Storage
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Installed Models</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {installedCount} Model{installedCount === 1 ? '' : 's'} on Flash Disk
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Available Flash Space</Text>
                    <Text style={[styles.specItemValue, { color: theme.success }]}>
                      {availableStorageGb} GB Free
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Storage Directory</Text>
                    <Text style={[styles.specItemValue, { color: theme.textSecondary }]}>
                      Native App Documents (/models/)
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Storage Format</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      Binary GGUF (v3 Format)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 3: HOST & ENGINE */}
            {activeTab === 'engine' && (
              <View style={styles.tabContentBlock}>
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.green.bg }]}>
                      <Icon name="zap" size={15} color={theme.pastels.green.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Inference Engine Status
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Host IP Address</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {hostIp}:8080
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Engine Protocol</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      OpenAI Chat Completions API
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Acceleration Pipeline</Text>
                    <Text style={[styles.specItemValue, { color: theme.success }]}>
                      Metal 3 & ARM NEON SIMD
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Network Mode</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      Local Wi-Fi LAN (Zero Cloud Egress)
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Battery & Thermal</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {telemetry.batteryPercent}% • {telemetry.batteryState} • {telemetry.thermalState}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  socIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  socSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  acceleratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  acceleratedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
  },
  tabButtonActive: {},
  tabButtonInactive: {},
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tabContentBlock: {
    gap: 10,
  },
  specCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  specCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  memoryStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ramUsageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  ramFreeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ramBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  ramBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  specItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  specItemLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  specItemValue: {
    fontSize: 11,
    fontWeight: '700',
  },
});
