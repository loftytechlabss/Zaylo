import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { colors } from '../theme/colors';
import type { ChatMessage, HybridMode } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: HybridMode;
  onSelectPromptSuggestion: (prompt: string) => void;
}

const PROMPT_SUGGESTIONS = [
  '⚡ Test on-device 3B memory paging',
  '📄 Summarize technical architecture',
  '💻 Write an async LRU cache in TypeScript',
  '🔒 Explain zero-cloud private inference',
];

export const ChatView: React.FC<ChatViewProps> = ({
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
      <View style={styles.emptyContainer}>
        <View style={styles.heroLogoContainer}>
          <Text style={styles.heroLogoText}>Z</Text>
        </View>
        <Text style={styles.heroTitle}>Private Local AI</Text>
        <Text style={styles.heroSubtitle}>
          {activeMode === 'on_device'
            ? 'Running locally with kernel virtual memory paging. Zero cloud servers.'
            : 'Streaming directly from your Zaylo Desktop Host over local network.'}
        </Text>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsHeader}>SUGGESTED PROMPTS</Text>
          {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionChip}
              onPress={() => onSelectPromptSuggestion(suggestion)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {messages.map((message) => {
        const isUser = message.role === 'user';

        return (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              isUser ? styles.userWrapper : styles.assistantWrapper,
            ]}
          >
            {/* Optional Attached Media Preview */}
            {message.imageUri && (
              <Image source={{ uri: message.imageUri }} style={styles.attachedImage} />
            )}

            {/* Bubble Container */}
            <View
              style={[
                styles.bubble,
                isUser ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
                {message.content}
                {message.isStreaming && <Text style={styles.cursor}> ▋</Text>}
              </Text>
            </View>

            {/* Telemetry / Metrics footer for Assistant responses */}
            {!isUser && message.metrics && (
              <View style={styles.metricsBadge}>
                <Text style={styles.metricsText}>
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
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  heroLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroLogoText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.cyan,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 8,
  },
  suggestionsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '88%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '96%',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.assistantBubble,
    borderWidth: 1,
    borderColor: colors.assistantBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: colors.textPrimary,
  },
  assistantText: {
    color: '#e4e4e7',
  },
  cursor: {
    color: colors.cyan,
    fontWeight: '700',
  },
  attachedImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginBottom: 6,
  },
  metricsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  metricsText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace',
    letterSpacing: 0.2,
  },
});
