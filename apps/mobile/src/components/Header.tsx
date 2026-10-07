import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { colors } from '../theme/colors';
import type { HybridMode, DesktopHost, OnDeviceModel, MemoryPagingConfig } from '../types';
import { Icon } from './common/Icon';

interface HeaderProps {
  mode: HybridMode;
  onToggleMode: (newMode: HybridMode) => void;
  desktopHost: DesktopHost;
  activeLocalModel: OnDeviceModel;
  pagingConfig: MemoryPagingConfig;
  onOpenMemoryModal: () => void;
  onOpenPairingModal: () => void;
  onOpenModelModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  desktopHost,
  activeLocalModel,
  pagingConfig,
  onOpenMemoryModal,
  onOpenPairingModal,
  onOpenModelModal,
}) => {
  const isDesktop = mode === 'desktop';

  return (
    <View style={styles.container}>
      {/* Top row: Brand & Status indicators */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>ZAYLO</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>DESKTOP ENGINE</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Memory Paging Gauge button */}
          <TouchableOpacity 
            style={styles.gaugeButton} 
            onPress={onOpenMemoryModal}
            activeOpacity={0.7}
          >
            <View style={styles.gaugeDot} />
            <Text style={styles.gaugeText}>
              {pagingConfig.estimatedFootprintMb} MB (Paged)
            </Text>
          </TouchableOpacity>

          {/* Desktop Pairing button */}
          <TouchableOpacity 
            style={[styles.iconButton, isDesktop && desktopHost.isConnected && styles.iconButtonActive]}
            onPress={onOpenPairingModal}
            activeOpacity={0.7}
          >
            <Icon name="monitor" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Switcher Pill */}
      <View style={styles.switcherContainer}>
        <TouchableOpacity
          style={[styles.switcherTab, !isDesktop && styles.switcherTabActive]}
          onPress={() => onToggleMode('on_device')}
          activeOpacity={0.8}
        >
          <Icon name="cpu" size={14} color={!isDesktop ? colors.accent : colors.textMuted} />
          <Text style={[styles.switcherLabel, !isDesktop && styles.switcherLabelActive]}>
            On-Device Engine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switcherTab, isDesktop && styles.switcherTabActive]}
          onPress={() => onToggleMode('desktop')}
          activeOpacity={0.8}
        >
          <Icon name="monitor" size={14} color={isDesktop ? colors.accent : colors.textMuted} />
          <Text style={[styles.switcherLabel, isDesktop && styles.switcherLabelActive]}>
            Desktop Host
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Model Subtitle Bar */}
      <TouchableOpacity 
        style={styles.modelBar} 
        onPress={onOpenModelModal}
        activeOpacity={0.7}
      >
        <Text style={styles.modelBarLabel}>ACTIVE MODEL:</Text>
        <Text style={styles.modelBarValue} numberOfLines={1}>
          {isDesktop 
            ? (desktopHost.isConnected ? (desktopHost.activeModelName || 'Desktop Model') : 'Disconnected (Tap to Pair)') 
            : `${activeLocalModel.name} (${activeLocalModel.quantization})`}
        </Text>
        <Icon name="chevron-down" size={13} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  badgePill: {
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gaugeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  gaugeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  gaugeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconButtonActive: {
    borderColor: colors.success,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  switcherTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  switcherTabActive: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  switcherLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  switcherLabelActive: {
    color: colors.textPrimary,
  },
  modelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  modelBarLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modelBarValue: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
