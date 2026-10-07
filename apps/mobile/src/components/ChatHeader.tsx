import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Theme } from '../theme/theme';
import type { HybridMode, DesktopHost, OnDeviceModel } from '../types';
import { Icon } from './common/Icon';

interface ChatHeaderProps {
  theme: Theme;
  mode: HybridMode;
  desktopHost: DesktopHost;
  activeLocalModel: OnDeviceModel;
  onBackToHome: () => void;
  onOpenModelModal: () => void;
  onClearChat: () => void;
  onToggleTheme: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  theme,
  mode,
  desktopHost,
  activeLocalModel,
  onBackToHome,
  onOpenModelModal,
  onClearChat,
  onToggleTheme,
}) => {
  const isDesktop = mode === 'desktop';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          borderBottomColor: theme.cardBorder,
        },
      ]}
    >
      {/* Back button */}
      <TouchableOpacity
        style={[
          styles.backButton,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          theme.shadows.sm,
        ]}
        onPress={onBackToHome}
        activeOpacity={0.7}
      >
        <Icon name="arrow-left" size={18} color={theme.textPrimary} />
      </TouchableOpacity>

      {/* Model chip in center */}
      <TouchableOpacity
        style={[
          styles.modelChip,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
          theme.shadows.sm,
        ]}
        onPress={onOpenModelModal}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: isDesktop
                ? desktopHost.isConnected
                  ? theme.success
                  : theme.danger
                : theme.accent,
            },
          ]}
        />
        <Text style={[styles.modelName, { color: theme.textPrimary }]} numberOfLines={1}>
          {isDesktop
            ? desktopHost.isConnected
              ? desktopHost.activeModelName || 'Desktop Model'
              : 'Desktop Host (Offline)'
            : activeLocalModel.name}
        </Text>
        <Icon name="chevron-down" size={14} color={theme.textMuted} />
      </TouchableOpacity>

      {/* Right actions: Clear chat & Theme switcher */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onClearChat}
          activeOpacity={0.7}
        >
          <Icon name="trash-2" size={15} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionBtn,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.sm,
          ]}
          onPress={onToggleTheme}
          activeOpacity={0.7}
        >
          <Icon
            name={theme.isDark ? 'sun' : 'moon'}
            size={15}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: '56%',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  modelName: {
    fontSize: 12,
    fontWeight: '700',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
