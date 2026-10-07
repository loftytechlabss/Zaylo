import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { darkTheme, Theme } from '../theme/theme';
import type { DesktopHost } from '../types';
import { DesktopClient } from '../engine/desktopClient';

interface PairingModalProps {
  visible: boolean;
  onClose: () => void;
  host: DesktopHost;
  onConnectHost: (newHost: DesktopHost) => void;
  theme?: Theme;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  onClose,
  host,
  onConnectHost,
  theme = darkTheme,
}) => {
  const [url, setUrl] = useState(host.url || 'http://192.168.1.100:8080');
  const [apiKey, setApiKey] = useState(host.apiKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    const result = await DesktopClient.ping(url, apiKey || undefined);
    setTesting(false);

    if (result.ok) {
      setTestResult(`✓ Connected! Latency: ${result.latencyMs}ms | Model: ${result.activeModel}`);
      onConnectHost({
        url,
        apiKey: apiKey || undefined,
        name: 'Zaylo Desktop Host',
        isConnected: true,
        latencyMs: result.latencyMs,
        activeModelName: result.activeModel,
        lastPingAt: Date.now(),
      });
    } else {
      setTestResult('✕ Host unreachable. Make sure LAN Network Access is enabled on Desktop.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
            theme.shadows.lg,
          ]}
        >
          <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>Desktop Sync</Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Pair with Zaylo Desktop Host on Wi-Fi
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>DESKTOP IP & PORT</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                },
              ]}
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.100:8080"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>API KEY (OPTIONAL)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  borderColor: theme.inputBorder,
                  color: theme.textPrimary,
                },
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="zaylo_sec_..."
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {testResult && (
              <View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: testResult.startsWith('✓')
                      ? theme.successLight
                      : 'rgba(239, 68, 68, 0.12)',
                    borderColor: testResult.startsWith('✓')
                      ? theme.success
                      : theme.danger,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultText,
                    {
                      color: testResult.startsWith('✓')
                        ? theme.success
                        : theme.danger,
                    },
                  ]}
                >
                  {testResult}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.connectButton,
                { backgroundColor: theme.accent },
                testing && { opacity: 0.6 },
                theme.shadows.md,
              ]}
              onPress={handleTestConnection}
              disabled={testing}
              activeOpacity={0.8}
            >
              {testing ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.connectButtonText}>Test & Connect Host</Text>
              )}
            </TouchableOpacity>

            <View style={[styles.tipCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.cardBorder }]}>
              <Text style={{ fontSize: 16 }}>💡</Text>
              <Text style={[styles.tipText, { color: theme.textMuted }]}>
                Ensure your phone and Mac/PC are connected to the same Wi-Fi network and Zaylo Desktop Host is running.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
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
    fontSize: 18,
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
  closeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    padding: 18,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  resultBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  connectButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
