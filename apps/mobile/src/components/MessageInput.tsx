import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { Theme } from '../theme/theme';
import type { HybridMode } from '../types';

interface MessageInputProps {
  theme: Theme;
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  activeMode: HybridMode;
  onAttachMedia?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  theme,
  onSendMessage,
  onStopGeneration,
  isStreaming,
  activeMode,
  onAttachMedia,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim() && !isStreaming) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.cardBorder,
          },
        ]}
      >
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.inputBg,
              borderColor: theme.inputBorder,
            },
            theme.shadows.sm,
          ]}
        >
          {/* Attachment / Camera Action */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={onAttachMedia}
            activeOpacity={0.7}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={[styles.textInput, { color: theme.textPrimary }]}
            placeholder={
              activeMode === 'on_device'
                ? 'Message local paged model...'
                : 'Message Zaylo Desktop Host...'
            }
            placeholderTextColor={theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={4000}
            editable={!isStreaming}
          />

          {/* Send or Stop Button */}
          {isStreaming ? (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.danger }]}
              onPress={onStopGeneration}
              activeOpacity={0.8}
            >
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.accent },
                !inputText.trim() && [styles.sendButtonDisabled, { backgroundColor: theme.cardElevated }],
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 16 }}>↑</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Engine status caption */}
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, { color: theme.textMuted }]}>
            {activeMode === 'on_device'
              ? '⚡ Running offline via kernel virtual memory paging'
              : '🖥️ Streaming from Desktop Fastify Gateway :8080'}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachIcon: {
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  stopSquare: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  captionContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  captionText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
