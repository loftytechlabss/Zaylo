import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { colors } from '../theme/colors';
import type { HybridMode } from '../types';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  isStreaming: boolean;
  activeMode: HybridMode;
  onAttachMedia?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputBar}>
          {/* Attachment / Camera Action */}
          <TouchableOpacity 
            style={styles.attachButton} 
            onPress={onAttachMedia}
            activeOpacity={0.7}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          {/* Core Input Field */}
          <TextInput
            style={styles.textInput}
            placeholder={
              activeMode === 'on_device'
                ? 'Message local paged model...'
                : 'Message Zaylo Desktop Host...'
            }
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={4000}
            editable={!isStreaming}
          />

          {/* Send or Stop Button */}
          {isStreaming ? (
            <TouchableOpacity 
              style={[styles.sendButton, styles.stopButton]} 
              onPress={onStopGeneration}
              activeOpacity={0.8}
            >
              <View style={styles.stopSquare} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Engine status caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>
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
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    color: colors.textSecondary,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.cardElevated,
    opacity: 0.5,
  },
  stopButton: {
    backgroundColor: colors.danger,
  },
  stopSquare: {
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  sendIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 20,
  },
  captionContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  captionText: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
});
