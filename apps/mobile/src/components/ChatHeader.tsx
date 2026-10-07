import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Theme } from '../theme/theme';
import type { HybridMode, DesktopHost, OnDeviceModel } from '../types';

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
        style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={onBackToHome}
        activeOpacity={0.7}
      >
        <Text style={[styles.backIcon, { color: theme.textPrimary }]}>←</Text>
      </TouchableOpacity>

      {/* Model chip in center */}
      <TouchableOpacity
        style={[
          styles.modelChip,
          { backgroundColor: theme.card, borderColor: theme.cardBorder },
          theme.shadows.sm,
        ]}
        onPress={onOpenModelModal}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isDesktop ? (desktopHost.isConnected ? theme.success : theme.danger) : theme.cyan },
          ]}
        />
        <Text style={[styles.modelName, { color: theme.textPrimary }]} numberOfLines={1}>
          {isDesktop
            ? desktopHost.isConnected
              ? desktopHost.activeModelName || 'Desktop Model'
              : 'Desktop Host (Offline)'
            : activeLocalModel.name}
        </Text>
        <Text style={[styles.chevron, { color: theme.textMuted }]}>▾</Text>
      </TouchableOpacity>

      {/* Right actions: Clear chat & Theme switcher */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={onClearChat}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14 }}>🗑️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={onToggleTheme}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14 }}>{theme.isDark ? '☀️' : '🌙'}</Text>
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
  backIcon: {
    fontSize: 18,
    fontWeight: '700',
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
  chevron: {
    fontSize: 12,
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
