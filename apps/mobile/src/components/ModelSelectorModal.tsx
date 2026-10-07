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
import { MOBILE_MODELS } from '../engine/deviceProfiler';
import type { OnDeviceModel, DeviceMemoryProfile } from '../types';

interface ModelSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  activeModel: OnDeviceModel;
  profile: DeviceMemoryProfile;
  onSelectModel: (model: OnDeviceModel) => void;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  visible,
  onClose,
  activeModel,
  profile,
  onSelectModel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>On-Device Models</Text>
              <Text style={styles.subtitle}>Select certified mobile-optimized LLM</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {MOBILE_MODELS.map((model) => {
              const isSelected = model.id === activeModel.id;
              const isRecommended = model.id === profile.recommendedModelId;
              const is3B = model.id.includes('3b');
              const canRun = is3B ? profile.canRun3B : true;

              return (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelCard,
                    isSelected && styles.modelCardSelected,
                    !canRun && styles.modelCardDisabled,
                  ]}
                  onPress={() => {
                    if (canRun) {
                      onSelectModel(model);
                      onClose();
                    }
                  }}
                  activeOpacity={canRun ? 0.7 : 1}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.modelName}>{model.name}</Text>
                        {isRecommended && (
                          <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>BEST FOR YOUR PHONE</Text>
                          </View>
                        )}
                        {is3B && (
                          <View style={styles.pagedBadge}>
                            <Text style={styles.pagedBadgeText}>PAGED MMAP</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tagline}>{model.tagline}</Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.statChip}>📦 {model.sizeMb} MB</Text>
                    <Text style={styles.statChip}>🧠 ~{model.requiredRamMb} MB RAM</Text>
                    <Text style={styles.statChip}>⚙️ {model.quantization}</Text>
                  </View>

                  {!canRun && (
                    <Text style={styles.disabledWarning}>
                      ⚠️ Requires 6GB+ RAM. Your device has {profile.totalRamMb} MB RAM.
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
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
  modelCard: {
    backgroundColor: colors.cardElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  modelCardSelected: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(6, 182, 212, 0.05)',
  },
  modelCardDisabled: {
    opacity: 0.5,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.success,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.success,
    letterSpacing: 0.5,
  },
  pagedBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cyan,
  },
  pagedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.cyan,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: {
    borderColor: colors.cyan,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.cyan,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: colors.textMuted,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  disabledWarning: {
    fontSize: 11,
    color: colors.warning,
    marginTop: 8,
  },
});
