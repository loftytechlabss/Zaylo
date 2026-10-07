import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { lightTheme, Theme } from '../theme/theme';
import type { DeviceMemoryProfile, MemoryPagingConfig, DeviceHardwareTelemetry } from '../types';
import { DeviceProfiler } from '../engine/deviceProfiler';
import { Icon } from './common/Icon';

interface MemoryGaugeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onUpdatePagingConfig: (newConfig: Partial<MemoryPagingConfig>) => void;
  theme?: Theme;
}

type TelemetryTab = 'silicon' | 'memory' | 'storage' | 'system';

export const MemoryGaugeModal: React.FC<MemoryGaugeModalProps> = ({
  visible,
  onClose,
  theme = lightTheme,
}) => {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('silicon');
  const [telemetry, setTelemetry] = useState<DeviceHardwareTelemetry>(() =>
    DeviceProfiler.getHardwareTelemetry()
  );

  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    if (visible) {
      DeviceProfiler.getHardwareTelemetryAsync().then((data) => {
        if (active) setTelemetry(data);
      });
    }
    return () => {
      active = false;
    };
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
                Hardware & Telemetry
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                {telemetry.socName}
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
              <Text style={[styles.socTitle, { color: theme.textPrimary }]}>
                {telemetry.socName}
              </Text>
              <Text style={[styles.socSubtitle, { color: theme.textMuted }]}>
                {telemetry.cpuTotalCores} Cores • {telemetry.gpuRenderer.split(' ')[0]} GPU • {telemetry.npuTopsInt8} TOPS NPU
              </Text>
            </View>
            <View style={[styles.acceleratedBadge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.acceleratedBadgeText, { color: theme.success }]}>
                ACCELERATED
              </Text>
            </View>
          </View>

          {/* Segmented Tabs */}
          <View style={styles.tabsRow}>
            {[
              { id: 'silicon', label: 'Chips & Cores', icon: 'cpu' },
              { id: 'memory', label: 'RAM & Paging', icon: 'layers' },
              { id: 'storage', label: 'Storage & I/O', icon: 'hard-drive' },
              { id: 'system', label: 'OS & Thermals', icon: 'activity' },
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
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* TAB 1: SILICON & CORES */}
            {activeTab === 'silicon' && (
              <View style={styles.tabContentBlock}>
                {/* 1. CPU Processor */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.blue.bg }]}>
                      <Icon name="cpu" size={15} color={theme.pastels.blue.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      CPU & Architecture
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Architecture</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.cpuArchitecture}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Total Cores</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.cpuTotalCores} Hardware Cores</Text>
                  </View>

                  <Text style={[styles.subHeading, { color: theme.textMuted, marginTop: 10 }]}>CLUSTER CONFIGURATION</Text>
                  {telemetry.cpuClusters.map((cluster, idx) => (
                    <View key={idx} style={styles.clusterRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.clusterTitle, { color: theme.textPrimary }]}>
                          {cluster.count}x {cluster.type} Cores
                        </Text>
                        <Text style={[styles.clusterFreq, { color: theme.textMuted }]}>
                          Clocked up to {cluster.clockGhz.toFixed(2)} GHz
                        </Text>
                      </View>
                      <View style={[styles.freqBarBg, { backgroundColor: theme.backgroundSecondary }]}>
                        <View
                          style={[
                            styles.freqBarFill,
                            {
                              width: `${Math.round((cluster.clockGhz / 4.0) * 100)}%`,
                              backgroundColor: cluster.type === 'Performance' || cluster.type === 'Prime'
                                ? theme.accent
                                : theme.pastels.blue.text,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}

                  <Text style={[styles.subHeading, { color: theme.textMuted, marginTop: 12 }]}>VECTOR & INSTRUCTION SETS</Text>
                  <View style={styles.chipTagsWrap}>
                    {telemetry.cpuInstructionSets.map((inst, i) => (
                      <View key={i} style={[styles.instructionTag, { backgroundColor: theme.backgroundSecondary }]}>
                        <Text style={[styles.instructionTagText, { color: theme.textPrimary }]}>{inst}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 2. GPU Compute */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.purple.bg }]}>
                      <Icon name="zap" size={15} color={theme.pastels.purple.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      GPU Hardware Compute
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Renderer</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.gpuRenderer}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Compute API</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.gpuComputeApi}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Half-Precision (FP16)</Text>
                    <Text style={[styles.specItemValue, { color: theme.accent }]}>{telemetry.gpuTflopsFp16} TFLOPS</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Memory Model</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {telemetry.gpuSharedMemory ? 'Unified Memory Architecture (Zero-Copy UMA)' : 'Dedicated VRAM'}
                    </Text>
                  </View>
                </View>

                {/* 3. NPU / Neural Engine */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.green.bg }]}>
                      <Icon name="activity" size={15} color={theme.pastels.green.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      NPU & Neural Accelerator
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Neural Engine</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.npuName}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>AI Peak Compute</Text>
                    <Text style={[styles.specItemValue, { color: theme.success, fontWeight: '800' }]}>{telemetry.npuTopsInt8} TOPS</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Driver Status</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.npuStatus}</Text>
                  </View>

                  <Text style={[styles.subHeading, { color: theme.textMuted, marginTop: 10 }]}>PRECISION SUPPORT</Text>
                  <View style={styles.chipTagsWrap}>
                    {telemetry.npuPrecisionSupport.map((prec, i) => (
                      <View key={i} style={[styles.instructionTag, { backgroundColor: theme.successLight }]}>
                        <Text style={[styles.instructionTagText, { color: theme.success }]}>{prec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* TAB 2: RAM & PAGING */}
            {activeTab === 'memory' && (
              <View style={styles.tabContentBlock}>
                {/* Memory Gauge Meter */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.blue.bg }]}>
                      <Icon name="layers" size={15} color={theme.pastels.blue.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Physical RAM Allocation
                    </Text>
                  </View>

                  {/* RAM Visual Bar */}
                  <View style={styles.ramBarContainer}>
                    <View style={styles.ramBarLabelsRow}>
                      <Text style={[styles.ramBarLabel, { color: theme.textPrimary }]}>
                        {telemetry.usedRamMb} MB Used ({Math.round((telemetry.usedRamMb / telemetry.totalRamMb) * 100)}%)
                      </Text>
                      <Text style={[styles.ramBarLabel, { color: theme.textMuted }]}>
                        {telemetry.availableRamMb} MB Free
                      </Text>
                    </View>

                    <View style={[styles.ramBarTrack, { backgroundColor: theme.backgroundSecondary }]}>
                      <View
                        style={[
                          styles.ramBarUsed,
                          {
                            width: `${Math.round((telemetry.usedRamMb / telemetry.totalRamMb) * 100)}%`,
                            backgroundColor: theme.accent,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Total Installed RAM</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {telemetry.totalRamMb} MB ({(telemetry.totalRamMb / 1024).toFixed(1)} GB)
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Memory Technology</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.ramType}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Peak Bus Bandwidth</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.ramBandwidthGbps} GB/s</Text>
                  </View>
                </View>

                {/* Virtual Memory Paging Engine */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.yellow.bg }]}>
                      <Icon name="refresh-cw" size={15} color={theme.pastels.yellow.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Kernel Virtual Memory Paging
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Virtual Paging Engine</Text>
                    <Text style={[styles.specItemValue, { color: theme.success }]}>Active (Demand Paging)</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Page Size</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.pageSizeKb} KB Pages</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>mmap Subsystem</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.mmapSupport}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Dirty Pages Flush Limit</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.dirtyPageThresholdMb} MB</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>KV Cache Optimization</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.kvCacheCompression}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 3: STORAGE & I/O */}
            {activeTab === 'storage' && (
              <View style={styles.tabContentBlock}>
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.green.bg }]}>
                      <Icon name="hard-drive" size={15} color={theme.pastels.green.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Flash Solid-State Storage
                    </Text>
                  </View>

                  <View style={styles.ramBarContainer}>
                    <View style={styles.ramBarLabelsRow}>
                      <Text style={[styles.ramBarLabel, { color: theme.textPrimary }]}>
                        {telemetry.storageAvailableGb} GB Free Space
                      </Text>
                      <Text style={[styles.ramBarLabel, { color: theme.textMuted }]}>
                        {telemetry.storageTotalGb} GB Total
                      </Text>
                    </View>

                    <View style={[styles.ramBarTrack, { backgroundColor: theme.backgroundSecondary }]}>
                      <View
                        style={[
                          styles.ramBarUsed,
                          {
                            width: `${Math.round(((telemetry.storageTotalGb - telemetry.storageAvailableGb) / telemetry.storageTotalGb) * 100)}%`,
                            backgroundColor: theme.pastels.green.text,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Storage Technology</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.storageType}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Sequential Read Speed</Text>
                    <Text style={[styles.specItemValue, { color: theme.accent, fontWeight: '800' }]}>
                      {telemetry.sequentialReadSpeedMbS} MB/s
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>mmap DMA Feasibility</Text>
                    <Text style={[styles.specItemValue, { color: theme.success }]}>
                      Ultra-Fast (Direct Page Fault Streaming)
                    </Text>
                  </View>
                </View>

                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.blue.bg }]}>
                      <Icon name="folder" size={15} color={theme.pastels.blue.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Zaylo Local Model Cache
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Model Directory</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>Sandbox Cache / GGUF</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Integrity Verification</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>SHA-256 Checksum on Download</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Persistence Mode</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>Offline Local Storage</Text>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 4: SYSTEM & THERMALS */}
            {activeTab === 'system' && (
              <View style={styles.tabContentBlock}>
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.pastels.purple.bg }]}>
                      <Icon name="activity" size={15} color={theme.pastels.purple.text} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Operating System & Kernel
                    </Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Operating System</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.osName}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Host Kernel</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>{telemetry.kernelVersion}</Text>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Thermal Headroom</Text>
                    <View style={[styles.pillBadge, { backgroundColor: theme.successLight }]}>
                      <Text style={[styles.pillBadgeText, { color: theme.success }]}>
                        {telemetry.thermalState} (Optimal)
                      </Text>
                    </View>
                  </View>

                  <View style={styles.specItemRow}>
                    <Text style={[styles.specItemLabel, { color: theme.textMuted }]}>Battery Status</Text>
                    <Text style={[styles.specItemValue, { color: theme.textPrimary }]}>
                      {telemetry.batteryPercent}% ({telemetry.batteryState})
                    </Text>
                  </View>
                </View>

                {/* Privacy & Airgap Assurance */}
                <View style={[styles.specCard, { backgroundColor: theme.card, borderColor: theme.cardBorder, marginTop: 14 }]}>
                  <View style={styles.specCardHeader}>
                    <View style={[styles.cardHeaderIcon, { backgroundColor: theme.successLight }]}>
                      <Icon name="shield" size={15} color={theme.success} />
                    </View>
                    <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>
                      Security & Privacy Sandbox
                    </Text>
                  </View>

                  <View style={styles.privacyItem}>
                    <Icon name="check-circle" size={15} color={theme.success} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>
                        100% Offline Weight Execution
                      </Text>
                      <Text style={[styles.privacyDesc, { color: theme.textMuted }]}>
                        All matrix calculations run strictly through local CPU, GPU, and NPU silicon without telemetry.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.privacyItem}>
                    <Icon name="check-circle" size={15} color={theme.success} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>
                        Zero External Network Connections
                      </Text>
                      <Text style={[styles.privacyDesc, { color: theme.textMuted }]}>
                        Model downloads pull directly from official Hugging Face GGUF repositories; no inference prompts are sent.
                      </Text>
                    </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 18,
    marginTop: 14,
    padding: 12,
    borderRadius: 18,
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
    fontWeight: '500',
    marginTop: 2,
  },
  acceleratedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acceleratedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    marginTop: 14,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {},
  tabButtonInactive: {},
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 18,
    paddingTop: 14,
    paddingBottom: 28,
  },
  tabContentBlock: {},
  specCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  specCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  specItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
  specItemLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  specItemValue: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '58%',
  },
  subHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  clusterTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  clusterFreq: {
    fontSize: 11,
    marginTop: 1,
  },
  freqBarBg: {
    width: 90,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  freqBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  chipTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  instructionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  instructionTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ramBarContainer: {
    marginBottom: 14,
  },
  ramBarLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ramBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  ramBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ramBarUsed: {
    height: '100%',
    borderRadius: 4,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  privacyItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacyDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
});
