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
import type { ChatMessage, HybridMode } from '../types';
import { ZLogo } from './common/ZLogo';
import { Icon } from './common/Icon';

interface ChatViewProps {
  theme: Theme;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: HybridMode;
  onSelectPromptSuggestion: (prompt: string) => void;
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
  onSelectPromptSuggestion,
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
            theme.shadows.sm,
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
                marginBottom: 12,
              }}
            />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            {activeMode === 'on_device'
              ? 'Local Chat Session'
              : 'Desktop Host Session'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {activeMode === 'on_device'
              ? 'Execute inference directly on your device with local model weights.'
              : 'Streaming directly from your Zaylo Desktop Host gateway on port 8080.'}
          </Text>
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
    padding: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  emptyHeroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyLogoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  suggestionsWrapper: {
    gap: 8,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  messageRow: {
    marginBottom: 14,
    maxWidth: '86%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  attachedImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  metricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  metricsText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
