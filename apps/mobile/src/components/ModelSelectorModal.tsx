import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { lightTheme, Theme } from '../theme/theme';
import { ZAYLO_MODELS } from '../engine/modelsCatalog';
import { ModelStorage } from '../engine/modelStorage';
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
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>On-Device Models</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Select certified mobile-optimized LLM
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

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
            {ZAYLO_MODELS.map((m) => {
              const isDownloaded = ModelStorage.isModelDownloaded(m.id);
              const isSelected = activeModel ? m.id === activeModel.id : false;
              const isRecommended = m.id === 'llama-3.2-1b-instruct';
              const isFlagship = m.sizeMb > 1500;
              const canRun = isFlagship ? profile.canRun3B : true;

              const convertedModel: OnDeviceModel = {
                id: m.id,
                name: m.name,
                tagline: m.description,
                parameters: m.parameterCount,
                sizeMb: m.sizeMb,
                requiredRamMb: Math.round(m.sizeMb * 1.3),
                minTier: isFlagship ? 'tier_3_flagship' : 'tier_2_balanced',
                quantization: m.quantization,
                downloadUrl: m.downloadUrl,
                isDownloaded,
              };

              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modelCard,
                    {
                      backgroundColor: isSelected ? theme.backgroundSecondary : theme.cardElevated,
                      borderColor: isSelected ? theme.accent : theme.cardBorder,
                    },
                    (!canRun || !isDownloaded) && { opacity: isDownloaded ? 0.6 : 0.8 },
                    theme.shadows.sm,
                  ]}
                  onPress={() => {
                    if (canRun && isDownloaded) {
                      onSelectModel(convertedModel);
                      handleClose();
                    }
                  }}
                  activeOpacity={canRun && isDownloaded ? 0.7 : 1}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleRow}>
                        <Text style={[styles.modelName, { color: theme.textPrimary }]}>
                          {m.name}
                        </Text>
                        {isRecommended && (
                          <View style={[styles.recommendedBadge, { backgroundColor: theme.accentLight }]}>
                            <Text style={[styles.recommendedText, { color: theme.accent }]}>
                              RECOMMENDED
                            </Text>
                          </View>
                        )}
                        {isDownloaded ? (
                          <View style={[styles.pagedBadge, { backgroundColor: theme.successLight }]}>
                            <Text style={[styles.pagedBadgeText, { color: theme.success }]}>
                              READY
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.pagedBadge, { backgroundColor: theme.backgroundSecondary }]}>
                            <Text style={[styles.pagedBadgeText, { color: theme.textMuted }]}>
                              NOT DOWNLOADED
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.tagline, { color: theme.textMuted }]}>
                        {m.description}
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
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>{m.sizeMb} MB</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Icon name="cpu" size={11} color={theme.accent} style={{ marginRight: 4 }} />
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>~{Math.round(m.sizeMb * 1.3)} MB</Text>
                    </View>
                    <View style={[styles.statChip, { backgroundColor: theme.backgroundSecondary }]}>
                      <Icon name="sliders" size={11} color={theme.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.statChipText, { color: theme.textSecondary }]}>{m.quantization}</Text>
                    </View>
                  </View>

                  {!isDownloaded && (
                    <View style={styles.warningRow}>
                      <Icon name="info" size={12} color={theme.textMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.disabledWarning, { color: theme.textMuted }]}>
                        Go to Model Studio tab to download this model first.
                      </Text>
                    </View>
                  )}

                  {isDownloaded && !canRun && (
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
        </Animated.View>
      </Animated.View>
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
    maxWidth: 480,
    maxHeight: '80%',
    borderRadius: 24,
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
    borderRadius: 16,
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
