/**
 * Typography Design Tokens
 * Sistema tipográfico para ElCastilloBarracas
 * Escala modular con ratios áureos y legibilidad optimizada
 */

export const typographyTokens = {
  // Font families
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
    serif: [
      'Crimson Text',
      'Georgia',
      'Cambria',
      '"Times New Roman"',
      'Times',
      'serif',
    ],
    mono: [
      'JetBrains Mono',
      'Menlo',
      'Monaco',
      'Consolas',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace',
    ],
    display: [
      'Playfair Display',
      'Georgia',
      'serif',
    ],
  },

  // Font sizes (rem based)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px - base
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem',    // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text utilities
  textCase: {
    uppercase: 'uppercase' as const,
    lowercase: 'lowercase' as const,
    capitalize: 'capitalize' as const,
    normal: 'none' as const,
  },

  // Semantic typography scales
  heading: {
    h1: {
      fontSize: '3rem',        // 48px
      fontWeight: '700',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
      fontFamily: 'display',
    },
    h2: {
      fontSize: '2.25rem',     // 36px
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em',
      fontFamily: 'display',
    },
    h3: {
      fontSize: '1.875rem',    // 30px
      fontWeight: '600',
      lineHeight: '1.375',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    h4: {
      fontSize: '1.5rem',      // 24px
      fontWeight: '600',
      lineHeight: '1.375',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    h5: {
      fontSize: '1.25rem',     // 20px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    h6: {
      fontSize: '1.125rem',    // 18px
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
  },

  body: {
    large: {
      fontSize: '1.125rem',    // 18px
      fontWeight: '400',
      lineHeight: '1.625',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    base: {
      fontSize: '1rem',        // 16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    small: {
      fontSize: '0.875rem',    // 14px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    xs: {
      fontSize: '0.75rem',     // 12px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'wide',
      fontFamily: 'sans',
    },
  },

  label: {
    large: {
      fontSize: '1rem',        // 16px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    base: {
      fontSize: '0.875rem',    // 14px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    small: {
      fontSize: '0.75rem',     // 12px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'wide',
      fontFamily: 'sans',
    },
  },

  button: {
    large: {
      fontSize: '1rem',        // 16px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    base: {
      fontSize: '0.875rem',    // 14px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      fontFamily: 'sans',
    },
    small: {
      fontSize: '0.75rem',     // 12px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'wide',
      fontFamily: 'sans',
    },
  },

  caption: {
    fontSize: '0.75rem',       // 12px
    fontWeight: '400',
    lineHeight: '1.375',
    letterSpacing: 'wide',
    fontFamily: 'sans',
  },

  overline: {
    fontSize: '0.75rem',       // 12px
    fontWeight: '600',
    lineHeight: '1.375',
    letterSpacing: 'widest',
    textTransform: 'uppercase' as const,
    fontFamily: 'sans',
  },

  code: {
    fontSize: '0.875rem',      // 14px
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: 'normal',
    fontFamily: 'mono',
  },
} as const;

export type TypographyToken = typeof typographyTokens;
export type FontFamily = keyof typeof typographyTokens.fontFamily;
export type FontSize = keyof typeof typographyTokens.fontSize;
export type FontWeight = keyof typeof typographyTokens.fontWeight;