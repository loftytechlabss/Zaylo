import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { colors } from '../theme/colors';
import type { DesktopHost } from '../types';
import { DesktopClient } from '../engine/desktopClient';

interface PairingModalProps {
  visible: boolean;
  onClose: () => void;
  host: DesktopHost;
  onConnectHost: (newHost: DesktopHost) => void;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  visible,
  onClose,
  host,
  onConnectHost,
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
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Desktop Host Pairing</Text>
              <Text style={styles.subtitle}>Connect to Zaylo Desktop on your local Wi-Fi</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* QR Pairing Option */}
          <View style={styles.qrPromptCard}>
            <Text style={styles.qrIcon}>📷</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.qrPromptTitle}>Scan QR Code on Desktop</Text>
              <Text style={styles.qrPromptDesc}>
                Open Zaylo Desktop → Server & API → Scan the Pairing QR with your phone camera.
              </Text>
            </View>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Manual Input Fields */}
          <Text style={styles.inputLabel}>SERVER ADDRESS (LAN IP)</Text>
          <TextInput
            style={styles.textInput}
            value={url}
            onChangeText={setUrl}
            placeholder="http://192.168.1.150:8080"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>API KEY (OPTIONAL)</Text>
          <TextInput
            style={styles.textInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="lcl_your_desktop_key"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          {testResult && (
            <View 
              style={[
                styles.feedbackBox, 
                testResult.startsWith('✓') ? styles.feedbackSuccess : styles.feedbackError
              ]}
            >
              <Text 
                style={[
                  styles.feedbackText,
                  testResult.startsWith('✓') ? { color: colors.success } : { color: colors.danger }
                ]}
              >
                {testResult}
              </Text>
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity
            style={styles.connectButton}
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  qrPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardElevated,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  qrIcon: {
    fontSize: 24,
  },
  qrPromptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  qrPromptDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.cardBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  feedbackBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: colors.success,
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  feedbackText: {
    fontSize: 11,
    lineHeight: 16,
  },
  connectButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
