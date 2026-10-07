import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { darkTheme, Theme } from '../theme/theme';
import type { DeviceMemoryProfile, MemoryPagingConfig } from '../types';

interface MemoryGaugeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onUpdatePagingConfig: (newConfig: Partial<MemoryPagingConfig>) => void;
  theme?: Theme;
}

export const MemoryGaugeModal: React.FC<MemoryGaugeModalProps> = ({
  visible,
  onClose,
  profile,
  pagingConfig,
  theme = darkTheme,
}) => {
  const ramUsagePercent = Math.min(
    100,
    Math.round((pagingConfig.estimatedFootprintMb / profile.totalRamMb) * 100)
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.lg,
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Memory & Paging</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Mobile RAM Guardian & Paging Controller
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18 }}>
            {/* Device Tier Badge */}
            <View style={[styles.tierBanner, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.tierDot, { backgroundColor: theme.cyan }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierTitle, { color: theme.textPrimary }]}>{profile.tierLabel}</Text>
                <Text style={[styles.tierDescription, { color: theme.textMuted }]}>
                  {profile.deviceTier === 'tier_3_flagship'
                    ? 'Flagship hardware detected. 3B models run smoothly with mmap & quantized KV.'
                    : profile.deviceTier === 'tier_2_balanced'
                    ? 'Balanced device detected. 1B models optimal; 3B models available in paged mode.'
                    : 'Eco hardware detected. Ultra-lightweight models (135M/360M) guaranteed to run smoothly.'}
                </Text>
              </View>
            </View>

            {/* Visual RAM Allocation Meter */}
            <View style={[styles.gaugeSection, { backgroundColor: theme.cardElevated, borderColor: theme.cardBorder }]}>
              <View style={styles.gaugeHeader}>
                <Text style={[styles.gaugeLabel, { color: theme.textMuted }]}>RAM ALLOCATION</Text>
                <Text style={[styles.gaugeValue, { color: theme.cyan }]}>
                  {pagingConfig.estimatedFootprintMb} MB / {profile.totalRamMb} MB ({ramUsagePercent}%)
                </Text>
              </View>

              <View style={[styles.progressBarTrack, { backgroundColor: theme.cardBorder }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${ramUsagePercent}%`,
                      backgroundColor: ramUsagePercent > 70 ? theme.warning : theme.cyan,
                    },
                  ]}
                />
              </View>

              <View style={styles.ramLegend}>
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  • Available RAM: {profile.availableRamMb} MB
                </Text>
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                  • Safe LLM Budget: {pagingConfig.ramBudgetMb} MB
                </Text>
              </View>
            </View>

            {/* Safeguards */}
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              ACTIVE MEMORY SAFEGUARDS
            </Text>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.checkPill, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.checkText, { color: theme.success }]}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Kernel Virtual Memory Paging (mmap)
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                  Weights stay in flash storage; the kernel pages active layers into RAM on demand.
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.checkPill, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.checkText, { color: theme.success }]}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Quantized KV Cache ({pagingConfig.kvCacheQuant.toUpperCase()})
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                  Cuts conversation context memory growth by 50%–75%.
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.checkPill, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.checkText, { color: theme.success }]}>✓</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Thermal Throttling Protection
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                  Dynamically paces token generation to prevent battery drain and CPU heating.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '82%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  tierBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  tierDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  gaugeSection: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gaugeValue: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  ramLegend: {
    gap: 4,
  },
  legendText: {
    fontSize: 11,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '800',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
