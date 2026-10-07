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

// Crisp White Theme (Zaylo Desktop Style - Clean, Modern, Precision)
export const lightTheme: Theme = {
  isDark: false,
  background: '#ffffff',
  backgroundSecondary: '#f8fafc',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  cardElevated: '#f8fafc',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  accent: '#2563eb', // Zaylo Blue
  accentLight: 'rgba(37, 99, 235, 0.08)',
  accentGlow: 'rgba(37, 99, 235, 0.16)',
  cyan: '#0284c7',
  cyanLight: 'rgba(2, 132, 199, 0.08)',
  cyanGlow: 'rgba(2, 132, 199, 0.14)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#f8fafc',
  inputBorder: '#cbd5e1',
  userBubble: '#0f172a', // Clean Deep Slate
  userText: '#ffffff',
  assistantBubble: '#f8fafc',
  assistantBorder: '#e2e8f0',
  assistantText: '#0f172a',
  divider: '#e2e8f0',
  shadows: {
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        } as any,
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
        } as any,
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)',
        } as any,
      }),
    },
  },
};

// Clean Slate/Zinc Dark Theme (Zaylo Desktop Style)
export const darkTheme: Theme = {
  isDark: true,
  background: '#090a0f',
  backgroundSecondary: '#111318',
  card: '#14161d',
  cardBorder: '#232630',
  cardElevated: '#1a1d26',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  accent: '#3b82f6',
  accentLight: 'rgba(59, 130, 246, 0.15)',
  accentGlow: 'rgba(59, 130, 246, 0.25)',
  cyan: '#38bdf8',
  cyanLight: 'rgba(56, 189, 248, 0.14)',
  cyanGlow: 'rgba(56, 189, 248, 0.2)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#111318',
  inputBorder: '#232630',
  userBubble: '#2563eb',
  userText: '#ffffff',
  assistantBubble: '#14161d',
  assistantBorder: '#232630',
  assistantText: '#f8fafc',
  divider: '#1c1f28',
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
          shadowRadius: 12,
        },
        android: {
          elevation: 5,
        },
        web: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
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
