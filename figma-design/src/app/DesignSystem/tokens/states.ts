/**
 * State Design Tokens
 * Estados interactivos y de feedback para ElCastilloBarracas
 * Incluye hover, focus, active, disabled y estados de validación
 */

export const stateTokens = {
  // Interactive states
  interactive: {
    // Hover states
    hover: {
      opacity: {
        high: '0.9',       // Para elementos principales
        medium: '0.8',     // Para elementos secundarios
        low: '0.7',        // Para elementos de baja prioridad
      },
      scale: {
        subtle: '1.02',    // Escalado sutil
        medium: '1.05',    // Escalado moderado
        strong: '1.1',     // Escalado pronunciado
      },
      brightness: {
        increase: '1.1',   // Aumentar brillo
        decrease: '0.9',   // Disminuir brillo
      },
    },

    // Focus states
    focus: {
      ring: {
        width: '2px',
        offset: '2px',
        opacity: '0.5',
      },
      outline: {
        width: '2px',
        style: 'solid',
        offset: '2px',
      },
      scale: '1.02',       // Escalado sutil en focus
    },

    // Active/Pressed states
    active: {
      opacity: '0.8',
      scale: '0.98',       // Ligeramente más pequeño cuando está presionado
      brightness: '0.9',
    },

    // Selected states
    selected: {
      opacity: '1',
      brightness: '1.1',
      contrast: '1.1',
    },
  },

  // Validation states
  validation: {
    // Success state
    success: {
      color: {
        light: '#22c55e',      // green-500
        dark: '#10b981',       // emerald-500
      },
      background: {
        light: '#f0fdf4',      // green-50
        dark: '#022c22',       // green-900/20
      },
      border: {
        light: '#22c55e',      // green-500
        dark: '#10b981',       // emerald-500
      },
      text: {
        light: '#15803d',      // green-700
        dark: '#34d399',       // emerald-400
      },
    },

    // Warning state
    warning: {
      color: {
        light: '#f59e0b',      // amber-500
        dark: '#fbbf24',       // amber-400
      },
      background: {
        light: '#fffbeb',      // amber-50
        dark: '#451a03',       // amber-900/20
      },
      border: {
        light: '#f59e0b',      // amber-500
        dark: '#fbbf24',       // amber-400
      },
      text: {
        light: '#92400e',      // amber-800
        dark: '#fcd34d',       // amber-300
      },
    },

    // Error state
    error: {
      color: {
        light: '#d4183d',      // Custom red
        dark: '#ef4444',       // red-500
      },
      background: {
        light: '#fef2f2',      // red-50
        dark: '#7f1d1d',       // red-900/20
      },
      border: {
        light: '#d4183d',      // Custom red
        dark: '#ef4444',       // red-500
      },
      text: {
        light: '#b91c1c',      // red-700
        dark: '#fca5a5',       // red-300
      },
    },

    // Info state
    info: {
      color: {
        light: '#3b82f6',      // blue-500
        dark: '#60a5fa',       // blue-400
      },
      background: {
        light: '#eff6ff',      // blue-50
        dark: '#1e3a8a',       // blue-900/20
      },
      border: {
        light: '#3b82f6',      // blue-500
        dark: '#60a5fa',       // blue-400
      },
      text: {
        light: '#1d4ed8',      // blue-700
        dark: '#93c5fd',       // blue-300
      },
    },
  },

  // Component states
  component: {
    // Button states
    button: {
      default: {
        opacity: '1',
        transform: 'scale(1)',
        transition: 'all 150ms ease-in-out',
      },
      hover: {
        opacity: '0.9',
        transform: 'scale(1.02)',
        transition: 'all 150ms ease-in-out',
      },
      active: {
        opacity: '0.8',
        transform: 'scale(0.98)',
        transition: 'all 100ms ease-in-out',
      },
      disabled: {
        opacity: '0.5',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
      loading: {
        opacity: '0.7',
        cursor: 'wait',
        pointerEvents: 'none',
      },
    },

    // Input states
    input: {
      default: {
        opacity: '1',
        borderWidth: '1px',
        transition: 'all 200ms ease-in-out',
      },
      focus: {
        opacity: '1',
        borderWidth: '2px',
        transform: 'scale(1.01)',
        transition: 'all 200ms ease-in-out',
      },
      disabled: {
        opacity: '0.5',
        cursor: 'not-allowed',
        backgroundColor: 'var(--color-muted)',
      },
      readonly: {
        opacity: '0.8',
        cursor: 'default',
        backgroundColor: 'var(--color-muted)',
      },
    },

    // Card states
    card: {
      default: {
        opacity: '1',
        transform: 'scale(1)',
        transition: 'all 200ms ease-in-out',
      },
      hover: {
        opacity: '1',
        transform: 'scale(1.02)',
        transition: 'all 200ms ease-in-out',
      },
      active: {
        opacity: '1',
        transform: 'scale(0.98)',
        transition: 'all 150ms ease-in-out',
      },
    },

    // Modal states
    modal: {
      entering: {
        opacity: '0',
        transform: 'scale(0.95)',
        transition: 'all 200ms ease-out',
      },
      entered: {
        opacity: '1',
        transform: 'scale(1)',
        transition: 'all 200ms ease-out',
      },
      exiting: {
        opacity: '0',
        transform: 'scale(0.95)',
        transition: 'all 150ms ease-in',
      },
    },

    // Dropdown states
    dropdown: {
      closed: {
        opacity: '0',
        transform: 'translateY(-10px) scale(0.95)',
        pointerEvents: 'none',
        transition: 'all 150ms ease-in',
      },
      open: {
        opacity: '1',
        transform: 'translateY(0) scale(1)',
        pointerEvents: 'auto',
        transition: 'all 200ms ease-out',
      },
    },
  },

  // Loading states
  loading: {
    // Spinner animations
    spinner: {
      duration: '1s',
      timingFunction: 'linear',
      iterationCount: 'infinite',
    },

    // Skeleton animations
    skeleton: {
      duration: '1.5s',
      timingFunction: 'ease-in-out',
      iterationCount: 'infinite',
      direction: 'alternate',
    },

    // Pulse animations
    pulse: {
      duration: '2s',
      timingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
      iterationCount: 'infinite',
    },

    // Progress bar states
    progress: {
      indeterminate: {
        duration: '1.5s',
        timingFunction: 'ease-in-out',
        iterationCount: 'infinite',
      },
    },
  },

  // Transition configurations
  transition: {
    // Duration presets
    duration: {
      fastest: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slowest: '500ms',
    },

    // Easing functions
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },

    // Common transition properties
    property: {
      all: 'all',
      colors: 'color, background-color, border-color',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
    },
  },

  // Animation presets
  animation: {
    // Fade animations
    fadeIn: {
      from: { opacity: '0' },
      to: { opacity: '1' },
      duration: '200ms',
      easing: 'ease-out',
    },
    fadeOut: {
      from: { opacity: '1' },
      to: { opacity: '0' },
      duration: '150ms',
      easing: 'ease-in',
    },

    // Scale animations
    scaleIn: {
      from: { opacity: '0', transform: 'scale(0.95)' },
      to: { opacity: '1', transform: 'scale(1)' },
      duration: '200ms',
      easing: 'ease-out',
    },
    scaleOut: {
      from: { opacity: '1', transform: 'scale(1)' },
      to: { opacity: '0', transform: 'scale(0.95)' },
      duration: '150ms',
      easing: 'ease-in',
    },

    // Slide animations
    slideInUp: {
      from: { opacity: '0', transform: 'translateY(10px)' },
      to: { opacity: '1', transform: 'translateY(0)' },
      duration: '200ms',
      easing: 'ease-out',
    },
    slideOutDown: {
      from: { opacity: '1', transform: 'translateY(0)' },
      to: { opacity: '0', transform: 'translateY(10px)' },
      duration: '150ms',
      easing: 'ease-in',
    },
  },
} as const;

export type StateToken = typeof stateTokens;
export type InteractiveState = keyof typeof stateTokens.interactive;
export type ValidationState = keyof typeof stateTokens.validation;