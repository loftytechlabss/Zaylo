import React, { useState, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text,
  Platform,
  Animated,
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
import { ModelsView } from './src/components/ModelsView';
import { ChatHeader } from './src/components/ChatHeader';
import { ChatView } from './src/components/ChatView';
import { MessageInput } from './src/components/MessageInput';
import { MemoryGaugeModal } from './src/components/MemoryGaugeModal';
import { PairingModal } from './src/components/PairingModal';
import { ModelSelectorModal } from './src/components/ModelSelectorModal';
import { Icon } from './src/components/common/Icon';

type ActiveScreen = 'home' | 'models' | 'chat';

const AnimatedNavTab: React.FC<{
  label?: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  theme: Theme;
}> = ({ label, icon, isActive, onPress, theme }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.floatingTab,
          isActive && [styles.floatingTabActive, { backgroundColor: theme.floatingNavActive }],
        ]}
        onPressIn={() =>
          Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 70,
            useNativeDriver: true,
          }).start()
        }
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Icon
          name={icon}
          size={18}
          color={isActive ? '#ffffff' : theme.floatingNavText}
        />
        {isActive && label && (
          <Text style={styles.floatingTabActiveText}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const theme: Theme = useMemo(
    () => (themeMode === 'light' ? lightTheme : darkTheme),
    [themeMode]
  );
  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const screenFadeAnim = useRef(new Animated.Value(1)).current;
  const screenSlideAnim = useRef(new Animated.Value(0)).current;
  const screenScaleAnim = useRef(new Animated.Value(1)).current;

  const navigateToScreen = (screen: ActiveScreen) => {
    if (screen === activeScreen) return;
    Animated.parallel([
      Animated.timing(screenFadeAnim, {
        toValue: 0.15,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(screenSlideAnim, {
        toValue: 6,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.timing(screenScaleAnim, {
        toValue: 0.985,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveScreen(screen);
      screenSlideAnim.setValue(-6);
      Animated.parallel([
        Animated.timing(screenFadeAnim, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(screenSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.spring(screenScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const initialProfile = useMemo(() => DeviceProfiler.profileDevice(), []);
  const [profile] = useState<DeviceMemoryProfile>(initialProfile);

  const [mode, setMode] = useState<HybridMode>('on_device');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const [desktopHost, setDesktopHost] = useState<DesktopHost>({
    url: 'http://192.168.1.100:8080',
    name: 'Zaylo Desktop Host',
    isConnected: false,
    activeModelName: 'Llama-3.2-1B-Instruct-Q4_K_M',
  });

  const [activeLocalModel, setActiveLocalModel] = useState<OnDeviceModel | null>(null);

  const [pagingConfig, setPagingConfig] = useState<MemoryPagingConfig>(
    initialProfile.pagingConfig
  );

  const [memoryModalVisible, setMemoryModalVisible] = useState(false);
  const [pairingModalVisible, setPairingModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  const cancelStreamRef = useRef<(() => void) | null>(null);

  const router = useMemo(() => {
    return new HybridRouter(
      () => mode,
      () => desktopHost,
      () => activeLocalModel,
      () => pagingConfig
    );
  }, [mode, desktopHost, activeLocalModel, pagingConfig]);

  const handleSendMessage = async (text: string) => {
    if (activeScreen !== 'chat') {
      navigateToScreen('chat');
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
        (chunk: string) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
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

  const handleSelectModel = (model: OnDeviceModel | null) => {
    setActiveLocalModel(model);
    if (model) {
      const optimized = MobileMemoryPagingEngine.optimizePagingConfig(
        model,
        profile.availableRamMb
      );
      setPagingConfig(optimized);
    }
  };

  const handleUpdatePagingConfig = (partial: Partial<MemoryPagingConfig>) => {
    setPagingConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleOpenChatWithPrompt = (initialPrompt?: string) => {
    navigateToScreen('chat');
    if (initialPrompt) {
      setTimeout(() => handleSendMessage(initialPrompt), 80);
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

      {/* Screen Container with animated transition */}
      <Animated.View
        style={[
          styles.screenContainer,
          {
            opacity: screenFadeAnim,
            transform: [
              { translateY: screenSlideAnim },
              { scale: screenScaleAnim },
            ],
          },
        ]}
      >
        {activeScreen === 'home' && (
          <HomeView
            theme={theme}
            mode={mode}
            onToggleMode={setMode}
            desktopHost={desktopHost}
            activeLocalModel={activeLocalModel}
            pagingConfig={pagingConfig}
            profile={profile}
            onOpenChat={handleOpenChatWithPrompt}
            onOpenModelModal={() => navigateToScreen('models')}
            onOpenPairingModal={() => setPairingModalVisible(true)}
            onOpenMemoryModal={() => setMemoryModalVisible(true)}
            onToggleTheme={toggleTheme}
          />
        )}

        {activeScreen === 'models' && (
          <ModelsView
            theme={theme}
            activeModel={activeLocalModel}
            profile={profile}
            pagingConfig={pagingConfig}
            onSelectModel={handleSelectModel}
            onBackToHome={() => navigateToScreen('home')}
            onOpenChat={() => navigateToScreen('chat')}
          />
        )}

        {activeScreen === 'chat' && (
          <View style={styles.chatScreenContainer}>
            <ChatHeader
              theme={theme}
              mode={mode}
              desktopHost={desktopHost}
              activeLocalModel={activeLocalModel}
              onBackToHome={() => navigateToScreen('home')}
              onOpenModelModal={() => navigateToScreen('models')}
              onClearChat={handleClearChat}
              onToggleTheme={toggleTheme}
            />

            <ChatView
              theme={theme}
              messages={messages}
              isStreaming={isStreaming}
              activeMode={mode}
              activeLocalModel={activeLocalModel}
              onSelectPromptSuggestion={handleSendMessage}
              onOpenModelModal={() => navigateToScreen('models')}
            />

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
      </Animated.View>

      {/* 5. Floating Island Bottom Navigation Bar (Hidden during Chat for full screen spaciousness) */}
      {activeScreen !== 'chat' && (
        <View
          style={[
            styles.floatingNavBar,
            { backgroundColor: theme.floatingNav },
            theme.shadows.floating,
          ]}
        >
          <AnimatedNavTab
            label="Home"
            icon="home"
            isActive={activeScreen === 'home'}
            onPress={() => navigateToScreen('home')}
            theme={theme}
          />

          <AnimatedNavTab
            label="Models"
            icon="cpu"
            isActive={activeScreen === 'models'}
            onPress={() => navigateToScreen('models')}
            theme={theme}
          />

          <AnimatedNavTab
            icon="message-square"
            isActive={false}
            onPress={() => navigateToScreen('chat')}
            theme={theme}
          />

          <AnimatedNavTab
            icon="monitor"
            isActive={false}
            onPress={() => setPairingModalVisible(true)}
            theme={theme}
          />

          <AnimatedNavTab
            icon="activity"
            isActive={false}
            onPress={() => setMemoryModalVisible(true)}
            theme={theme}
          />
        </View>
      )}

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
  screenContainer: {
    flex: 1,
  },
  chatScreenContainer: {
    flex: 1,
  },
  floatingNavBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 36,
    paddingVertical: 8,
    paddingHorizontal: 10,
    zIndex: 999,
  },
  floatingTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 24,
    gap: 6,
  },
  floatingTabActive: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
  },
  floatingTabActiveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
