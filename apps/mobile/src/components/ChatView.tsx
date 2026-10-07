import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type { ChatMessage, HybridMode, OnDeviceModel } from '../types';
import { ZLogo } from './common/ZLogo';
import { Icon } from './common/Icon';

interface ChatViewProps {
  theme: Theme;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: HybridMode;
  activeLocalModel?: OnDeviceModel | null;
  onSelectPromptSuggestion: (prompt: string) => void;
  onOpenModelModal?: () => void;
}

interface ChatSuggestion {
  iconName: string;
  text: string;
}

const CHAT_SUGGESTIONS: ChatSuggestion[] = [
  { iconName: 'code', text: 'Help me refactor a function for performance' },
  { iconName: 'terminal', text: 'Explain the difference between TCP and UDP' },
  { iconName: 'database', text: 'How do database indexes improve query speed?' },
  { iconName: 'file-text', text: 'Draft a clean technical release note' },
];

export const ChatView: React.FC<ChatViewProps> = ({
  theme,
  messages,
  isStreaming,
  activeMode,
  activeLocalModel,
  onSelectPromptSuggestion,
  onOpenModelModal,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.emptyContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.emptyHeroCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
            theme.shadows.md,
          ]}
        >
          <View style={styles.emptyLogoWrapper}>
            <ZLogo
              size={36}
              variant={theme.isDark ? 'white' : 'dark'}
              withContainer
              containerBg={theme.isDark ? '#1a1d26' : '#f1f5f9'}
              containerStyle={{
                borderWidth: 1,
                borderColor: theme.cardBorder,
                marginBottom: 16,
              }}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            {activeMode === 'on_device'
              ? activeLocalModel
                ? activeLocalModel.name
                : 'Local Engine'
              : 'Desktop Host Session'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {activeMode === 'on_device'
              ? activeLocalModel
                ? 'Zero-cloud execution on device hardware with kernel memory paging.'
                : 'No model loaded yet. Choose and download a certified model to chat offline.'
              : 'Streaming directly from your Zaylo Desktop Host gateway on port 8080.'}
          </Text>

          {activeMode === 'on_device' && !activeLocalModel && onOpenModelModal && (
            <TouchableOpacity
              style={[
                styles.selectModelCta,
                { backgroundColor: theme.floatingNav },
                theme.shadows.sm,
              ]}
              onPress={onOpenModelModal}
              activeOpacity={0.8}
            >
              <Icon name="layers" size={14} color="#ffffff" />
              <Text style={styles.selectModelCtaText}>Choose & Load Model</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.suggestionsWrapper}>
          <Text style={[styles.suggestionsLabel, { color: theme.textMuted }]}>
            SUGGESTIONS
          </Text>
          {CHAT_SUGGESTIONS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.suggestionChip,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.cardBorder,
                },
                theme.shadows.sm,
              ]}
              onPress={() => onSelectPromptSuggestion(item.text)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.suggestionIconBox,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <Icon name={item.iconName} size={15} color={theme.accent} />
              </View>
              <Text
                style={[styles.suggestionText, { color: theme.textPrimary }]}
                numberOfLines={2}
              >
                {item.text}
              </Text>
              <Icon name="arrow-up-right" size={14} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.messagesContainer}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => {
        const isUser = message.role === 'user';

        return (
          <View
            key={message.id}
            style={[
              styles.messageRow,
              isUser ? styles.userRow : styles.assistantRow,
            ]}
          >
            {message.imageUri && (
              <Image source={{ uri: message.imageUri }} style={styles.attachedImage} />
            )}

            <View
              style={[
                styles.bubble,
                isUser
                  ? [
                      styles.userBubble,
                      {
                        backgroundColor: theme.userBubble,
                      },
                      theme.shadows.sm,
                    ]
                  : [
                      styles.assistantBubble,
                      {
                        backgroundColor: theme.assistantBubble,
                        borderColor: theme.assistantBorder,
                      },
                      theme.shadows.sm,
                    ],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: isUser ? theme.userText : theme.assistantText },
                ]}
              >
                {message.content}
                {message.isStreaming && (
                  <Text style={{ color: theme.accent, fontWeight: '800' }}> ▋</Text>
                )}
              </Text>
            </View>

            {!isUser && message.metrics && (
              <View
                style={[
                  styles.metricsBadge,
                  {
                    backgroundColor: theme.cardElevated,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Icon
                  name={message.metrics.backendUsed === 'on_device_paged' ? 'cpu' : 'monitor'}
                  size={11}
                  color={theme.accent}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.metricsText, { color: theme.textMuted }]}>
                  {message.metrics.tokensPerSec} tok/s • {message.metrics.ttftMs}ms TTFT
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContentContainer: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyHeroCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  selectModelCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 22,
    marginTop: 18,
  },
  selectModelCtaText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  suggestionsWrapper: {
    gap: 10,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  messagesContainer: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  messageRow: {
    marginBottom: 18,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  attachedImage: {
    width: 200,
    height: 130,
    borderRadius: 16,
    marginBottom: 8,
  },
  bubble: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    borderWidth: 1.5,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  metricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricsText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
