import React, { useState, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import { darkTheme, lightTheme, Theme } from './src/theme/theme';
import type {
  HybridMode,
  ChatMessage,
  DesktopHost,
  OnDeviceModel,
  MemoryPagingConfig,
  DeviceMemoryProfile,
} from './src/types';
import { DeviceProfiler, MOBILE_MODELS } from './src/engine/deviceProfiler';
import { MobileMemoryPagingEngine } from './src/engine/memoryPaging';
import { HybridRouter } from './src/engine/hybridRouter';
import { HomeView } from './src/components/HomeView';
import { ChatHeader } from './src/components/ChatHeader';
import { ChatView } from './src/components/ChatView';
import { MessageInput } from './src/components/MessageInput';
import { MemoryGaugeModal } from './src/components/MemoryGaugeModal';
import { PairingModal } from './src/components/PairingModal';
import { ModelSelectorModal } from './src/components/ModelSelectorModal';

type ActiveScreen = 'home' | 'chat';

export default function App() {
  // Theme state: dark vs light
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const theme: Theme = useMemo(
    () => (themeMode === 'dark' ? darkTheme : lightTheme),
    [themeMode]
  );
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Screen Navigation state (Defaults to Home Hub instead of raw chatbot!)
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');

  // 1. Initial Device & Paging Profiling
  const initialProfile = useMemo(() => DeviceProfiler.profileDevice(), []);
  const [profile] = useState<DeviceMemoryProfile>(initialProfile);

  // 2. Active Hybrid Mode & Chat State
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
    // If sent from Home, ensure we switch to chat screen
    if (activeScreen !== 'chat') {
      setActiveScreen('chat');
    }

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
    } catch {
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

  const handleOpenChatWithPrompt = (initialPrompt?: string) => {
    setActiveScreen('chat');
    if (initialPrompt) {
      setTimeout(() => handleSendMessage(initialPrompt), 50);
    }
  };

  const handleClearChat = () => {
    if (cancelStreamRef.current) {
      cancelStreamRef.current();
      cancelStreamRef.current = null;
    }
    setIsStreaming(false);
    setMessages([]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Screen Router */}
      {activeScreen === 'home' ? (
        <HomeView
          theme={theme}
          mode={mode}
          onToggleMode={setMode}
          desktopHost={desktopHost}
          activeLocalModel={activeLocalModel}
          pagingConfig={pagingConfig}
          profile={profile}
          onOpenChat={handleOpenChatWithPrompt}
          onOpenModelModal={() => setModelModalVisible(true)}
          onOpenPairingModal={() => setPairingModalVisible(true)}
          onOpenMemoryModal={() => setMemoryModalVisible(true)}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <View style={styles.chatScreenContainer}>
          {/* Chat Dedicated Top Header */}
          <ChatHeader
            theme={theme}
            mode={mode}
            desktopHost={desktopHost}
            activeLocalModel={activeLocalModel}
            onBackToHome={() => setActiveScreen('home')}
            onOpenModelModal={() => setModelModalVisible(true)}
            onClearChat={handleClearChat}
            onToggleTheme={toggleTheme}
          />

          {/* Chat Messages Body */}
          <ChatView
            theme={theme}
            messages={messages}
            isStreaming={isStreaming}
            activeMode={mode}
            onSelectPromptSuggestion={handleSendMessage}
          />

          {/* Floating Message Input */}
          <MessageInput
            theme={theme}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isStreaming={isStreaming}
            activeMode={mode}
            onAttachMedia={() => {
              handleSendMessage('[Attached image from camera: diagram.png] Please analyze this image.');
            }}
          />
        </View>
      )}

      {/* Bottom Global Navigation Bar */}
      <View
        style={[
          styles.bottomNavBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.cardBorder,
          },
          theme.shadows.md,
        ]}
      >
        <TouchableOpacity
          style={[styles.navTab, activeScreen === 'home' && styles.navTabActive]}
          onPress={() => setActiveScreen('home')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navTabIcon, activeScreen === 'home' && { color: theme.accent }]}>
            🏠
          </Text>
          <Text
            style={[
              styles.navTabLabel,
              { color: activeScreen === 'home' ? theme.accent : theme.textMuted },
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navTab, activeScreen === 'chat' && styles.navTabActive]}
          onPress={() => setActiveScreen('chat')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navTabIcon, activeScreen === 'chat' && { color: theme.accent }]}>
            💬
          </Text>
          <Text
            style={[
              styles.navTabLabel,
              { color: activeScreen === 'chat' ? theme.accent : theme.textMuted },
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setModelModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.navTabIcon}>🧠</Text>
          <Text style={[styles.navTabLabel, { color: theme.textMuted }]}>Models</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setPairingModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.navTabIcon}>🖥️</Text>
          <Text style={[styles.navTabLabel, { color: theme.textMuted }]}>Desktop</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setMemoryModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.navTabIcon}>📊</Text>
          <Text style={[styles.navTabLabel, { color: theme.textMuted }]}>RAM</Text>
        </TouchableOpacity>
      </View>

      {/* Modals with Theme Support */}
      <MemoryGaugeModal
        visible={memoryModalVisible}
        onClose={() => setMemoryModalVisible(false)}
        profile={profile}
        pagingConfig={pagingConfig}
        onUpdatePagingConfig={handleUpdatePagingConfig}
        theme={theme}
      />

      <PairingModal
        visible={pairingModalVisible}
        onClose={() => setPairingModalVisible(false)}
        host={desktopHost}
        onConnectHost={(newHost) => {
          setDesktopHost(newHost);
          setMode('desktop');
        }}
        theme={theme}
      />

      <ModelSelectorModal
        visible={modelModalVisible}
        onClose={() => setModelModalVisible(false)}
        activeModel={activeLocalModel}
        profile={profile}
        onSelectModel={handleSelectModel}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatScreenContainer: {
    flex: 1,
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 14 : 8,
    borderTopWidth: 1,
  },
  navTab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  navTabActive: {
    transform: [{ scale: 1.05 }],
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
