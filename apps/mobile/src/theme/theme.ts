import { Platform, ViewStyle } from 'react-native';

export interface ThemeShadows {
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  floating: ViewStyle;
}

export interface PastelPalette {
  blue: { bg: string; border: string; text: string; iconBg: string };
  purple: { bg: string; border: string; text: string; iconBg: string };
  yellow: { bg: string; border: string; text: string; iconBg: string };
  green: { bg: string; border: string; text: string; iconBg: string };
  peach: { bg: string; border: string; text: string; iconBg: string };
}

export interface Theme {
  isDark: boolean;
  background: string;
  backgroundSecondary: string;
  card: string;
  cardBorder: string;
  cardElevated: string;
  floatingNav: string;
  floatingNavText: string;
  floatingNavActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentGlow: string;
  cyan: string;
  cyanLight: string;
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
  pastels: PastelPalette;
  shadows: ThemeShadows;
}

// Modern Neumorphic Soft Pastel Light Theme (matching user reference)
export const lightTheme: Theme = {
  isDark: false,
  background: '#eef4ff', // Soft atmospheric sky blue backdrop
  backgroundSecondary: '#f4f8ff',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  cardElevated: '#ffffff',
  floatingNav: '#0f172a', // Floating dark pill nav
  floatingNavText: '#94a3b8',
  floatingNavActive: '#1e293b',
  textPrimary: '#0f172a', // Deep slate primary
  textSecondary: '#334155',
  textMuted: '#64748b',
  accent: '#2563eb', // Vibrant blue
  accentLight: 'rgba(37, 99, 235, 0.08)',
  accentGlow: 'rgba(37, 99, 235, 0.16)',
  cyan: '#0284c7',
  cyanLight: 'rgba(2, 132, 199, 0.08)',
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.12)',
  warning: '#f59e0b',
  danger: '#ef4444',
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  userBubble: '#0f172a',
  userText: '#ffffff',
  assistantBubble: '#ffffff',
  assistantBorder: '#e2e8f0',
  assistantText: '#0f172a',
  divider: '#e2e8f0',
  pastels: {
    blue: {
      bg: '#e0f2fe',
      border: '#bae6fd',
      text: '#0369a1',
      iconBg: '#38bdf8',
    },
    purple: {
      bg: '#f3e8ff',
      border: '#e9d5ff',
      text: '#7e22ce',
      iconBg: '#c084fc',
    },
    yellow: {
      bg: '#fef3c7',
      border: '#fde68a',
      text: '#b45309',
      iconBg: '#fbbf24',
    },
    green: {
      bg: '#dcfce7',
      border: '#bbf7d0',
      text: '#15803d',
      iconBg: '#4ade80',
    },
    peach: {
      bg: '#ffedd5',
      border: '#fed7aa',
      text: '#c2410c',
      iconBg: '#fb923c',
    },
  },
  shadows: {
    sm: {
      ...Platform.select({
        ios: {
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        android: {
          elevation: 2,
        },
        web: {
          boxShadow: '0 2px 8px rgba(100, 116, 139, 0.06)',
        } as any,
      }),
    },
    md: {
      ...Platform.select({
        ios: {
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: '0 6px 18px rgba(100, 116, 139, 0.08)',
        } as any,
      }),
    },
    lg: {
      ...Platform.select({
        ios: {
          shadowColor: '#64748b',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: '0 12px 32px rgba(100, 116, 139, 0.12)',
        } as any,
      }),
    },
    floating: {
      ...Platform.select({
        ios: {
          shadowColor: '#0f172a',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.22)',
        } as any,
      }),
    },
  },
};

// Sleek Slate Dark Theme
export const darkTheme: Theme = {
  isDark: true,
  background: '#090a0f',
  backgroundSecondary: '#111318',
  card: '#14161d',
  cardBorder: '#232630',
  cardElevated: '#1a1d26',
  floatingNav: '#0f172a',
  floatingNavText: '#64748b',
  floatingNavActive: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  accent: '#3b82f6',
  accentLight: 'rgba(59, 130, 246, 0.15)',
  accentGlow: 'rgba(59, 130, 246, 0.25)',
  cyan: '#38bdf8',
  cyanLight: 'rgba(56, 189, 248, 0.14)',
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
  pastels: {
    blue: {
      bg: '#0c2238',
      border: '#0e3a63',
      text: '#7dd3fc',
      iconBg: '#0284c7',
    },
    purple: {
      bg: '#1e1138',
      border: '#381c6e',
      text: '#d8b4fe',
      iconBg: '#7c3aed',
    },
    yellow: {
      bg: '#2e2008',
      border: '#573d0f',
      text: '#fde047',
      iconBg: '#d97706',
    },
    green: {
      bg: '#0a261a',
      border: '#144d34',
      text: '#86efac',
      iconBg: '#16a34a',
    },
    peach: {
      bg: '#2b160e',
      border: '#572b1a',
      text: '#fdba74',
      iconBg: '#ea580c',
    },
  },
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
    floating: {
      ...Platform.select({
        ios: {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
        web: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
        } as any,
      }),
    },
  },
};
