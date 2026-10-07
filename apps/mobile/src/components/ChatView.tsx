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

interface ChatViewProps {
  theme: Theme;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: HybridMode;
  onSelectPromptSuggestion: (prompt: string) => void;
}

const CHAT_SUGGESTIONS = [
  '⚡ Test on-device memory paging latency',
  '🔒 Explain zero-cloud private inference',
  '💻 Write an async LRU cache in TypeScript',
  '📄 Summarize technical architecture',
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
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.md,
          ]}
        >
          <View style={[styles.emptyIconBox, { backgroundColor: theme.accentLight }]}>
            <Text style={{ fontSize: 24 }}>💬</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            {activeMode === 'on_device' ? 'Local Neural Session' : 'Desktop Host Session'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
            {activeMode === 'on_device'
              ? 'Zero-cloud execution via kernel virtual memory paging.'
              : 'Streaming directly from your Zaylo Desktop Host over local LAN.'}
          </Text>
        </View>

        <View style={styles.suggestionsWrapper}>
          <Text style={[styles.suggestionsLabel, { color: theme.textMuted }]}>
            QUICK PROMPTS
          </Text>
          {CHAT_SUGGESTIONS.map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.suggestionChip,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                theme.shadows.sm,
              ]}
              onPress={() => onSelectPromptSuggestion(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={[styles.suggestionText, { color: theme.textPrimary }]}>
                {suggestion}
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
            {/* Optional Attached Media Preview */}
            {message.imageUri && (
              <Image source={{ uri: message.imageUri }} style={styles.attachedImage} />
            )}

            {/* Bubble */}
            <View
              style={[
                styles.bubble,
                isUser
                  ? [styles.userBubble, { backgroundColor: theme.userBubble }, theme.shadows.sm]
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
                  <Text style={{ color: theme.cyan, fontWeight: '800' }}> ▋</Text>
                )}
              </Text>
            </View>

            {/* Telemetry / Metrics footer */}
            {!isUser && message.metrics && (
              <View style={[styles.metricsBadge, { backgroundColor: theme.cardElevated, borderColor: theme.cardBorder }]}>
                <Text style={[styles.metricsText, { color: theme.textMuted }]}>
                  {message.metrics.backendUsed === 'on_device_paged' ? '⚡ ' : '🖥️ '}
                  {message.metrics.tokensPerSec} tok/s • {message.metrics.ttftMs}ms TTFT
                  {message.metrics.ramUsageMb ? ` • ~${message.metrics.ramUsageMb} MB RAM` : ''}
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  suggestionsWrapper: {
    gap: 10,
  },
  suggestionsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  suggestionChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  messageRow: {
    marginBottom: 16,
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
    borderRadius: 18,
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
    fontSize: 15,
    lineHeight: 22,
  },
  metricsBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  metricsText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});
