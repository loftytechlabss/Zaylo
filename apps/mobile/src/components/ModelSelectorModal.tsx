import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { lightTheme, Theme } from '../theme/theme';
import { MOBILE_MODELS } from '../engine/deviceProfiler';
import type { OnDeviceModel, DeviceMemoryProfile } from '../types';
import { Icon } from './common/Icon';

interface ModelSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  activeModel: OnDeviceModel | null;
  profile: DeviceMemoryProfile;
  onSelectModel: (model: OnDeviceModel) => void;
  theme?: Theme;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  visible,
  onClose,
  activeModel,
  profile,
  onSelectModel,
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
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>On-Device Models</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Select certified mobile-optimized LLM
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Icon name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            {MOBILE_MODELS.map((model) => {
              const isSelected = activeModel ? model.id === activeModel.id : false;
              const isRecommended = model.id === profile.recommendedModelId;
              const is3B = model.id.includes('3b');
              const canRun = is3B ? profile.canRun3B : true;

              return (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.modelCard,
                    {
                      backgroundColor: isSelected ? theme.backgroundSecondary : theme.cardElevated,
                      borderColor: isSelected ? theme.accent : theme.cardBorder,
                    },
                    !canRun && { opacity: 0.5 },
                    theme.shadows.sm,
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
                        <Text style={[styles.modelName, { color: theme.textPrimary }]}>
                          {model.name}
                        </Text>
                        {isRecommended && (
                          <View style={[styles.recommendedBadge, { backgroundColor: theme.accentLight }]}>
                            <Text style={[styles.recommendedText, { color: theme.accent }]}>
                              RECOMMENDED
                            </Text>
                          </View>
                        )}
                        {is3B && (
                          <View style={[styles.pagedBadge, { backgroundColor: theme.cyanLight }]}>
                            <Text style={[styles.pagedBadgeText, { color: theme.cyan }]}>
                              PAGED MMAP
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.tagline, { color: theme.textMuted }]}>
                        {model.tagline}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: isSelected ? theme.accent : theme.cardBorder },
                        isSelected && { backgroundColor: theme.accent },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={[styles.statChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Icon name="package" size={11} color={theme.accent} style={{ marginRight: 4 }} />
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>{model.sizeMb} MB</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Icon name="cpu" size={11} color={theme.accent} style={{ marginRight: 4 }} />
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>~{model.requiredRamMb} MB</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Icon name="sliders" size={11} color={theme.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>{model.quantization}</Text>
                    </View>
                  </View>

                  {!canRun && (
                    <View style={styles.warningRow}>
                      <Icon name="alert-triangle" size={12} color={theme.warning} style={{ marginRight: 4 }} />
                      <Text style={[styles.disabledWarning, { color: theme.warning }]}>
                        Requires 6GB+ RAM. Your device has {profile.totalRamMb} MB RAM.
                      </Text>
                    </View>
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
  modelCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '700',
  },
  recommendedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recommendedText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pagedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pagedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 11,
    lineHeight: 15,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledWarning: {
    fontSize: 11,
  },
});
