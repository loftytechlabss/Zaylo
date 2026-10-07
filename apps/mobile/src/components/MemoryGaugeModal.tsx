import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { lightTheme, Theme } from '../theme/theme';
import type { DeviceMemoryProfile, MemoryPagingConfig } from '../types';
import { Icon } from './common/Icon';

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
  theme = lightTheme,
}) => {
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
              <Text style={[styles.title, { color: theme.textPrimary }]}>System & Telemetry</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Hardware Architecture & Inference Runtime Status
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Icon name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18 }}>
            {/* Runtime Status Card */}
            <View style={[styles.statusBanner, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>
                  Zaylo Engine Active
                </Text>
                <Text style={[styles.statusDescription, { color: theme.textMuted }]}>
                  Native client running on {Platform.OS.toUpperCase()} with zero cloud telemetry.
                </Text>
              </View>
            </View>

            {/* Hardware & Runtime Specifications */}
            <Text style={[styles.sectionHeading, { color: theme.textMuted }]}>
              RUNTIME SPECIFICATIONS
            </Text>

            <View style={[styles.specsTable, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <Text style={[styles.specLabel, { color: theme.textMuted }]}>Platform</Text>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  {Platform.OS === 'ios' ? 'Apple iOS' : Platform.OS === 'android' ? 'Google Android' : 'Web Browser'}
                </Text>
              </View>

              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <Text style={[styles.specLabel, { color: theme.textMuted }]}>Inference Protocol</Text>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  OpenAI SSE Streaming
                </Text>
              </View>

              <View style={[styles.specRow, { borderBottomColor: theme.cardBorder }]}>
                <Text style={[styles.specLabel, { color: theme.textMuted }]}>Default Gateway</Text>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  :8080 (Fastify v1.4.0)
                </Text>
              </View>

              <View style={styles.specRow}>
                <Text style={[styles.specLabel, { color: theme.textMuted }]}>Model Format</Text>
                <Text style={[styles.specValue, { color: theme.textPrimary }]}>
                  GGUF (v3)
                </Text>
              </View>
            </View>

            {/* Network & Security Details */}
            <Text style={[styles.sectionHeading, { color: theme.textMuted, marginTop: 16 }]}>
              SECURITY & PRIVACY
            </Text>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.checkPill, { backgroundColor: theme.successLight }]}>
                <Icon name="check" size={12} color={theme.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  Local Area Network Only
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                  All inference requests stay restricted to your local network and physical host.
                </Text>
              </View>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <View style={[styles.checkPill, { backgroundColor: theme.successLight }]}>
                <Icon name="check" size={12} color={theme.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>
                  End-to-End Private Weights
                </Text>
                <Text style={[styles.featureDesc, { color: theme.textMuted }]}>
                  Model weights execute locally without logging prompts to third-party providers.
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
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
    fontSize: 17,
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  specsTable: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
});
