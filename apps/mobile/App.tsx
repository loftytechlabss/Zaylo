import React, { useState, useMemo, useRef } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  StatusBar 
} from 'react-native';
import { colors } from './src/theme/colors';
import type { 
  HybridMode, 
  ChatMessage, 
  DesktopHost, 
  OnDeviceModel, 
  MemoryPagingConfig, 
  DeviceMemoryProfile 
} from './src/types';
import { DeviceProfiler, MOBILE_MODELS } from './src/engine/deviceProfiler';
import { MobileMemoryPagingEngine } from './src/engine/memoryPaging';
import { HybridRouter } from './src/engine/hybridRouter';
import { Header } from './src/components/Header';
import { ChatView } from './src/components/ChatView';
import { MessageInput } from './src/components/MessageInput';
import { MemoryGaugeModal } from './src/components/MemoryGaugeModal';
import { PairingModal } from './src/components/PairingModal';
import { ModelSelectorModal } from './src/components/ModelSelectorModal';

export default function App() {
  // 1. Initial Device & Paging Profiling
  const initialProfile = useMemo(() => DeviceProfiler.profileDevice(), []);
  const [profile, setProfile] = useState<DeviceMemoryProfile>(initialProfile);

  // 2. Active State
  const [mode, setMode] = useState<HybridMode>('on_device');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // 3. Desktop Host State
  const [desktopHost, setDesktopHost] = useState<DesktopHost>({
    url: 'http://192.168.1.100:8080',
    name: 'Zaylo Desktop Host',
    isConnected: false,
    activeModelName: 'Llama-3.2-1B-Instruct-Q4_K_M',
  });

  // 4. On-Device Model & Memory Paging Config
  const [activeLocalModel, setActiveLocalModel] = useState<OnDeviceModel>(
    MOBILE_MODELS.find((m) => m.id === initialProfile.recommendedModelId) || MOBILE_MODELS[2]
  );

  const [pagingConfig, setPagingConfig] = useState<MemoryPagingConfig>(
    initialProfile.pagingConfig
  );

  // 5. Active Modals
  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [pairingModalVisible, setPairingModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  // 6. Router Setup
  const cancelStreamRef = useRef<(() => void) | null>(null);

  const router = useMemo(() => {
    return new HybridRouter(
      () => mode,
      () => desktopHost,
      () => activeLocalModel,
      () => pagingConfig
    );
  }, [mode, desktopHost, activeLocalModel, pagingConfig]);

  // 7. Message Handlers
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const assistantId = `msg_${Date.now()}_a`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const newHistory = [...messages, userMessage];
    setMessages([...newHistory, initialAssistantMessage]);
    setIsStreaming(true);

    try {
      const cancelFn = await router.dispatchPrompt(
        newHistory,
        // On Token
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        // On Complete
        (metrics) => {
          setIsStreaming(false);
          cancelStreamRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, isStreaming: false, metrics }
                : m
            )
          );
        },
        // On Error
        (err) => {
          setIsStreaming(false);
          cancelStreamRef.current = null;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      m.content +
                      `\n\n[Error: ${err.message || 'Inference connection failed. Please check host or switch to on-device engine.'}]`,
                    isStreaming: false,
                  }
                : m
            )
          );
        }
      );

      cancelStreamRef.current = cancelFn;
    } catch (err: any) {
      setIsStreaming(false);
    }
  };

  const handleStopGeneration = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  };

  const handleSelectModel = (model: OnDeviceModel) => {
    setActiveLocalModel(model);
    const optimized = MobileMemoryPagingEngine.optimizePagingConfig(
      model,
      profile.availableRamMb
    );
    setPagingConfig(optimized);
  };

  const handleUpdatePagingConfig = (partial: Partial<MemoryPagingConfig>) => {
    setPagingConfig((prev) => ({ ...prev, ...partial }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header with Hybrid Mode Switcher & Memory Pill */}
      <Header
        mode={mode}
        onToggleMode={setMode}
        desktopHost={desktopHost}
        activeLocalModel={activeLocalModel}
        pagingConfig={pagingConfig}
        onOpenMemoryModal={() => setMemoryModalVisible(true)}
        onOpenPairingModal={() => setPairingModalVisible(true)}
        onOpenModelModal={() => setModelModalVisible(true)}
      />

      {/* Message Stream View */}
      <ChatView
        messages={messages}
        isStreaming={isStreaming}
        activeMode={mode}
        onSelectPromptSuggestion={handleSendMessage}
      />

      {/* Floating Bottom Input Bar */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isStreaming={isStreaming}
        activeMode={mode}
        onAttachMedia={() => {
          // Simulation of camera / image attachment
          handleSendMessage('[Attached image from camera: diagram.png] Please analyze this image.');
        }}
      />

      {/* Memory & Paging Drawer Modal */}
      <MemoryGaugeModal
        visible={memoryModalVisible}
        onClose={() => setMemoryModalVisible(false)}
        profile={profile}
        pagingConfig={pagingConfig}
        onUpdatePagingConfig={handleUpdatePagingConfig}
      />

      {/* Desktop Wi-Fi / QR Pairing Modal */}
      <PairingModal
        visible={pairingModalVisible}
        onClose={() => setPairingModalVisible(false)}
        host={desktopHost}
        onConnectHost={(newHost) => {
          setDesktopHost(newHost);
          setMode('desktop');
        }}
      />

      {/* On-Device & Desktop Model Selector */}
      <ModelSelectorModal
        visible={modelModalVisible}
        onClose={() => setModelModalVisible(false)}
        activeModel={activeLocalModel}
        profile={profile}
        onSelectModel={handleSelectModel}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
