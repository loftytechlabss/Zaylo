import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { colors } from '../theme/colors';
import type { DeviceMemoryProfile, MemoryPagingConfig } from '../types';

interface MemoryGaugeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: DeviceMemoryProfile;
  pagingConfig: MemoryPagingConfig;
  onUpdatePagingConfig: (newConfig: Partial<MemoryPagingConfig>) => void;
}

export const MemoryGaugeModal: React.FC<MemoryGaugeModalProps> = ({
  visible,
  onClose,
  profile,
  pagingConfig,
  onUpdatePagingConfig,
}) => {
  const ramUsagePercent = Math.min(
    100,
    Math.round((pagingConfig.estimatedFootprintMb / profile.totalRamMb) * 100)
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Memory & Paging Engine</Text>
              <Text style={styles.subtitle}>Mobile RAM Guardian & 3B Paging Controller</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Device Tier Badge */}
            <View style={styles.tierBanner}>
              <View style={styles.tierDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.tierTitle}>{profile.tierLabel}</Text>
                <Text style={styles.tierDescription}>
                  {profile.deviceTier === 'tier_3_flagship'
                    ? 'Flagship hardware detected. 3B models run smoothly with mmap & quantized KV.'
                    : profile.deviceTier === 'tier_2_balanced'
                    ? 'Balanced device detected. 1B models optimal; 3B models available in paged mode.'
                    : 'Eco hardware detected. Ultra-lightweight models (135M/360M) guaranteed to run smoothly.'}
                </Text>
              </View>
            </View>

            {/* Visual RAM Allocation Meter */}
            <View style={styles.gaugeSection}>
              <View style={styles.gaugeHeader}>
                <Text style={styles.gaugeLabel}>RAM ALLOCATION</Text>
                <Text style={styles.gaugeValue}>
                  {pagingConfig.estimatedFootprintMb} MB / {profile.totalRamMb} MB ({ramUsagePercent}%)
                </Text>
              </View>

              <View style={styles.progressBarTrack}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${ramUsagePercent}%` },
                    ramUsagePercent > 70 ? styles.progressWarning : styles.progressNormal
                  ]} 
                />
              </View>

              <View style={styles.ramLegend}>
                <Text style={styles.legendText}>• Available RAM: {profile.availableRamMb} MB</Text>
                <Text style={styles.legendText}>• Safe LLM Budget: {pagingConfig.ramBudgetMb} MB</Text>
              </View>
            </View>

            {/* Core Paging Feature Checklist */}
            <Text style={styles.sectionHeading}>ACTIVE MEMORY PAGING SAFEGUARDS</Text>

            <View style={styles.featureItem}>
              <View style={styles.checkPill}><Text style={styles.checkText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Kernel Virtual Memory Paging (mmap)</Text>
                <Text style={styles.featureDesc}>
                  Weights remain in flash storage; the Linux/Android kernel only pages active tensors into physical RAM. Eliminates process termination by Android LowMemoryKiller.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkPill}><Text style={styles.checkText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>
                  Quantized KV Cache ({pagingConfig.kvCacheQuant.toUpperCase()})
                </Text>
                <Text style={styles.featureDesc}>
                  Compresses attention memory from 16-bit to 8-bit/4-bit. Cuts conversation RAM growth by 50%–75%.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkPill}><Text style={styles.checkText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>Micro-Batched Ingestion (n_ubatch: {pagingConfig.nUbatch})</Text>
                <Text style={styles.featureDesc}>
                  Evaluates prompt tokens in small 128-token pages, flattening peak RAM spikes.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkPill}><Text style={styles.checkText}>✓</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featureTitle}>
                  Sliding-Window Context Paging ({pagingConfig.contextWindow} tokens)
                </Text>
                <Text style={styles.featureDesc}>
                  Prunes older historical turns dynamically to keep working set strictly bounded.
                </Text>
              </View>
            </View>

            {/* Quick Toggle Controls */}
            <Text style={styles.sectionHeading}>PAGING PROFILE PRESETS</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity
                style={[
                  styles.presetButton,
                  pagingConfig.contextWindow === 1024 && styles.presetButtonActive,
                ]}
                onPress={() =>
                  onUpdatePagingConfig({
                    contextWindow: 1024,
                    kvCacheQuant: 'q4_0',
                    estimatedFootprintMb: 850,
                  })
                }
              >
                <Text style={styles.presetText}>Eco Paged (1K Ctx)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetButton,
                  pagingConfig.contextWindow === 2048 && styles.presetButtonActive,
                ]}
                onPress={() =>
                  onUpdatePagingConfig({
                    contextWindow: 2048,
                    kvCacheQuant: 'q8_0',
                    estimatedFootprintMb: 1200,
                  })
                }
              >
                <Text style={styles.presetText}>Standard (2K Ctx)</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  tierBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.cardElevated,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cyan,
    marginBottom: 16,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cyan,
    marginTop: 5,
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cyan,
    marginBottom: 2,
  },
  tierDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  gaugeSection: {
    backgroundColor: colors.cardElevated,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 18,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gaugeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  gaugeValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.inputBg,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressNormal: {
    backgroundColor: colors.cyan,
  },
  progressWarning: {
    backgroundColor: colors.warning,
  },
  ramLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '700',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  presetButton: {
    flex: 1,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetButtonActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
