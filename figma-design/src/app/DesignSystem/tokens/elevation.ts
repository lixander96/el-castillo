/**
 * Elevation Design Tokens
 * Sistema de elevación y sombras para ElCastilloBarracas
 * Profundidad visual y jerarquía de componentes
 */

export const elevationTokens = {
  // Base shadow scale
  shadow: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Dark theme shadows (more pronounced)
  shadowDark: {
    none: 'none',
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.6)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
  },

  // Component-specific elevations
  component: {
    // Cards
    card: {
      resting: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      hover: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      pressed: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },

    // Buttons
    button: {
      resting: 'none',
      hover: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      pressed: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      elevated: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },

    // Inputs
    input: {
      resting: 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      focus: '0 0 0 3px rgb(59 130 246 / 0.1), inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
      error: '0 0 0 3px rgb(239 68 68 / 0.1), inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },

    // Modals and overlays
    modal: {
      backdrop: 'none', // Backdrop uses opacity instead
      content: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    },

    // Dropdowns and popovers
    dropdown: {
      resting: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      animated: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },

    // Navigation
    nav: {
      bar: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      floating: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },

    // Tooltips
    tooltip: {
      resting: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },

    // Floating Action Button
    fab: {
      resting: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      hover: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      pressed: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    },
  },

  // Z-index scale for proper layering
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1020,
    banner: 1030,
    overlay: 1040,
    modal: 1050,
    popover: 1060,
    skipLink: 1070,
    toast: 1080,
    tooltip: 1090,
  },

  // Colored shadows for special effects
  coloredShadow: {
    primary: {
      sm: '0 1px 3px 0 rgb(3 2 19 / 0.1), 0 1px 2px -1px rgb(3 2 19 / 0.1)',
      md: '0 4px 6px -1px rgb(3 2 19 / 0.1), 0 2px 4px -2px rgb(3 2 19 / 0.1)',
      lg: '0 10px 15px -3px rgb(3 2 19 / 0.1), 0 4px 6px -4px rgb(3 2 19 / 0.1)',
    },
    success: {
      sm: '0 1px 3px 0 rgb(34 197 94 / 0.1), 0 1px 2px -1px rgb(34 197 94 / 0.1)',
      md: '0 4px 6px -1px rgb(34 197 94 / 0.1), 0 2px 4px -2px rgb(34 197 94 / 0.1)',
      lg: '0 10px 15px -3px rgb(34 197 94 / 0.1), 0 4px 6px -4px rgb(34 197 94 / 0.1)',
    },
    warning: {
      sm: '0 1px 3px 0 rgb(245 158 11 / 0.1), 0 1px 2px -1px rgb(245 158 11 / 0.1)',
      md: '0 4px 6px -1px rgb(245 158 11 / 0.1), 0 2px 4px -2px rgb(245 158 11 / 0.1)',
      lg: '0 10px 15px -3px rgb(245 158 11 / 0.1), 0 4px 6px -4px rgb(245 158 11 / 0.1)',
    },
    error: {
      sm: '0 1px 3px 0 rgb(212 24 61 / 0.1), 0 1px 2px -1px rgb(212 24 61 / 0.1)',
      md: '0 4px 6px -1px rgb(212 24 61 / 0.1), 0 2px 4px -2px rgb(212 24 61 / 0.1)',
      lg: '0 10px 15px -3px rgb(212 24 61 / 0.1), 0 4px 6px -4px rgb(212 24 61 / 0.1)',
    },
  },

  // Glow effects for special states
  glow: {
    primary: '0 0 20px rgb(3 2 19 / 0.3)',
    success: '0 0 20px rgb(34 197 94 / 0.3)',
    warning: '0 0 20px rgb(245 158 11 / 0.3)',
    error: '0 0 20px rgb(212 24 61 / 0.3)',
    info: '0 0 20px rgb(59 130 246 / 0.3)',
  },
} as const;

export type ElevationToken = typeof elevationTokens;
export type ShadowScale = keyof typeof elevationTokens.shadow;
export type ZIndexScale = keyof typeof elevationTokens.zIndex;