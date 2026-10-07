import { Platform, ViewStyle } from 'react-native';

export interface ThemeShadows {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
}

export interface Theme {
  isDark: boolean;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  cardElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentGlow: string;
  cyan: string;
  cyanLight: string;
  cyanGlow: string;
  success: string;
  successLight: string;
  warning: string;
  danger: string;
  inputBg: string;
  inputBorder: string;
  userBubble: string;
  userText: string;
  assistantBubble: string;
  assistantBorder: string;
  assistantText: string;
  divider: string;
  shadows: ThemeShadows;
}

export const darkTheme: Theme = {
  isDark: true,
  background: '#09090b',
  backgroundSecondary: '#121215',
  card: '#141418',
  cardBorder: '#232329',
  cardElevated: '#1a1a21',
  textPrimary: '#fafafa',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  accent: '#2563eb',
  accentLight: 'rgba(37, 99, 235, 0.16)',
  accentGlow: 'rgba(37, 99, 235, 0.25)',
  cyan: '#06b6d4',
  cyanLight: 'rgba(6, 182, 212, 0.14)',
  cyanGlow: 'rgba(6, 182, 212, 0.22)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.14)',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#131317',
  inputBorder: '#272730',
  userBubble: '#1d283a',
  userText: '#f8fafc',
  assistantBubble: '#141418',
  assistantBorder: '#23232a',
  assistantText: '#f4f4f5',
  divider: '#1c1c22',
  shadows: {
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
        } as any,
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.45,
          shadowRadius: 10,
        },
        android: {
          elevation: 5,
        },
        web: {
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.45)',
        } as any,
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        } as any,
      }),
    },
  },
};

export const lightTheme: Theme = {
  isDark: false,
  background: '#f8fafc',
  backgroundSecondary: '#f1f5f9',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  cardElevated: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  accent: '#2563eb',
  accentLight: 'rgba(37, 99, 235, 0.1)',
  accentGlow: 'rgba(37, 99, 235, 0.18)',
  cyan: '#0891b2',
  cyanLight: 'rgba(8, 145, 178, 0.1)',
  cyanGlow: 'rgba(8, 145, 178, 0.16)',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.1)',
  warning: '#d97706',
  danger: '#dc2626',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  userBubble: '#2563eb',
  userText: '#ffffff',
  assistantBubble: '#ffffff',
  assistantBorder: '#e2e8f0',
  assistantText: '#0f172a',
  divider: '#e2e8f0',
  shadows: {
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
        } as any,
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
        } as any,
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.12)',
        } as any,
      }),
    },
  },
};
