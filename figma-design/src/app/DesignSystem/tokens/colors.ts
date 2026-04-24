/**
 * Color Design Tokens
 * Sistema de colores para ElCastilloBarracas con soporte dark/light
 * Cumple estándares WCAG AA para accesibilidad
 */

export const colorTokens = {
  // Semantic colors
  semantic: {
    primary: {
      50: '#f0f0ff',
      100: '#e6e6ff',
      200: '#d1d1ff',
      300: '#b3b3ff',
      400: '#8080ff',
      500: '#4d4dff',
      600: '#030213', // Principal
      700: '#020111',
      800: '#01010c',
      900: '#000008',
    },
    secondary: {
      50: '#f9f9fb',
      100: '#f3f3f7',
      200: '#e9e9ef',
      300: '#d9d9e3',
      400: '#b8b8cc',
      500: '#9797b5',
      600: '#717182',
      700: '#5a5a68',
      800: '#45454f',
      900: '#2f2f37',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#d4183d', // Principal
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
  },

  // Neutral palette
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Theme-specific colors
  light: {
    background: '#ffffff',
    foreground: 'oklch(0.145 0 0)',
    card: '#ffffff',
    cardForeground: 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.145 0 0)',
    primary: '#030213',
    primaryForeground: 'oklch(1 0 0)',
    secondary: 'oklch(0.95 0.0058 264.53)',
    secondaryForeground: '#030213',
    muted: '#ececf0',
    mutedForeground: '#717182',
    accent: '#e9ebef',
    accentForeground: '#030213',
    destructive: '#d4183d',
    destructiveForeground: '#ffffff',
    border: 'rgba(0, 0, 0, 0.1)',
    input: 'transparent',
    inputBackground: '#f3f3f5',
    switchBackground: '#cbced4',
    ring: 'oklch(0.708 0 0)',
  },

  dark: {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.145 0 0)',
    cardForeground: 'oklch(0.985 0 0)',
    popover: 'oklch(0.145 0 0)',
    popoverForeground: 'oklch(0.985 0 0)',
    primary: 'oklch(0.985 0 0)',
    primaryForeground: 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    secondaryForeground: 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    mutedForeground: 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    accentForeground: 'oklch(0.985 0 0)',
    destructive: 'oklch(0.396 0.141 25.723)',
    destructiveForeground: 'oklch(0.637 0.237 25.331)',
    border: 'oklch(0.269 0 0)',
    input: 'oklch(0.269 0 0)',
    inputBackground: 'oklch(0.205 0 0)',
    switchBackground: 'oklch(0.439 0 0)',
    ring: 'oklch(0.439 0 0)',
  },

  // Chart colors
  charts: {
    light: {
      1: 'oklch(0.646 0.222 41.116)',
      2: 'oklch(0.6 0.118 184.704)',
      3: 'oklch(0.398 0.07 227.392)',
      4: 'oklch(0.828 0.189 84.429)',
      5: 'oklch(0.769 0.188 70.08)',
    },
    dark: {
      1: 'oklch(0.488 0.243 264.376)',
      2: 'oklch(0.696 0.17 162.48)',
      3: 'oklch(0.769 0.188 70.08)',
      4: 'oklch(0.627 0.265 303.9)',
      5: 'oklch(0.645 0.246 16.439)',
    },
  },

  // Brand colors específicos de ElCastilloBarracas
  brand: {
    castle: '#030213', // Color principal del castillo
    barraca: '#717182', // Color secundario barracas
    gold: '#f59e0b', // Dorado para elementos premium
    silver: '#9ca3af', // Plateado para elementos secundarios
  },
} as const;

export type ColorToken = typeof colorTokens;
export type SemanticColor = keyof typeof colorTokens.semantic;
export type ColorShade = keyof typeof colorTokens.semantic.primary;