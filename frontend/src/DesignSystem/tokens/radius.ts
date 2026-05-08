/**
 * Border Radius Design Tokens
 * Sistema de radios de borde para ElCastilloBarracas
 * Consistencia en formas y esquinas redondeadas
 */

export const radiusTokens = {
  // Base radius scale
  radius: {
    none: '0',
    xs: '0.125rem',      // 2px
    sm: '0.25rem',       // 4px - calc(var(--radius) - 6px)
    md: '0.375rem',      // 6px - calc(var(--radius) - 4px)
    lg: '0.5rem',        // 8px - var(--radius) - DEPRECATED: usar base
    base: '0.625rem',    // 10px - var(--radius) principal
    xl: '0.75rem',       // 12px - calc(var(--radius) + 2px)
    '2xl': '1rem',       // 16px - calc(var(--radius) + 6px)
    '3xl': '1.5rem',     // 24px
    full: '9999px',      // Completamente redondeado
  },

  // Semantic radius for different component types
  component: {
    // Buttons
    button: {
      sm: '0.375rem',    // 6px
      md: '0.5rem',      // 8px
      lg: '0.625rem',    // 10px - base radius
      pill: '9999px',    // Pill buttons
    },

    // Inputs
    input: {
      sm: '0.25rem',     // 4px
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px
    },

    // Cards
    card: {
      sm: '0.5rem',      // 8px
      md: '0.625rem',    // 10px - base radius
      lg: '0.75rem',     // 12px
      xl: '1rem',        // 16px
    },

    // Modals and overlays
    modal: {
      sm: '0.5rem',      // 8px
      md: '0.75rem',     // 12px
      lg: '1rem',        // 16px
      xl: '1.5rem',      // 24px
    },

    // Badges and tags
    badge: {
      sm: '0.25rem',     // 4px
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px
      pill: '9999px',    // Pill badges
    },

    // Avatars
    avatar: {
      sm: '0.25rem',     // 4px - slightly rounded
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px
      round: '50%',      // Circular avatars
    },

    // Images
    image: {
      sm: '0.25rem',     // 4px
      md: '0.375rem',    // 6px
      lg: '0.5rem',      // 8px
      xl: '0.75rem',     // 12px
    },

    // Navigation elements
    nav: {
      tab: '0.375rem',   // 6px
      pill: '9999px',    // Pill navigation
      segment: '0.5rem', // 8px - segmented controls
    },

    // Dropdowns and popovers
    dropdown: {
      sm: '0.375rem',    // 6px
      md: '0.5rem',      // 8px
      lg: '0.625rem',    // 10px
    },

    // Progress bars
    progress: {
      sm: '0.125rem',    // 2px
      md: '0.25rem',     // 4px
      lg: '0.375rem',    // 6px
      round: '9999px',   // Rounded progress
    },

    // Separators and dividers
    separator: {
      sm: '0.125rem',    // 2px
      md: '0.25rem',     // 4px
      lg: '0.375rem',    // 6px
    },
  },

  // Interactive states
  interactive: {
    // Focus rings - typically larger radius for better visibility
    focus: {
      sm: '0.5rem',      // 8px
      md: '0.625rem',    // 10px
      lg: '0.75rem',     // 12px
    },

    // Hover states - can be different from default
    hover: {
      increase: '0.125rem', // Add to base radius on hover
      decrease: '0.0625rem', // Subtract from base radius on hover
    },
  },

  // Layout elements
  layout: {
    // Container and wrapper elements
    container: {
      sm: '0.5rem',      // 8px
      md: '0.75rem',     // 12px
      lg: '1rem',        // 16px
      xl: '1.5rem',      // 24px
    },

    // Panel and sidebar elements
    panel: {
      sm: '0.375rem',    // 6px
      md: '0.5rem',      // 8px
      lg: '0.75rem',     // 12px
    },
  },

  // Special cases
  special: {
    // Notification toasts
    toast: '0.5rem',     // 8px
    
    // Tooltips
    tooltip: '0.25rem',  // 4px
    
    // Skeleton loaders
    skeleton: '0.25rem', // 4px
    
    // Code blocks
    code: '0.25rem',     // 4px
    
    // Callouts and alerts
    alert: '0.5rem',     // 8px
  },
} as const;

export type RadiusToken = typeof radiusTokens;
export type RadiusScale = keyof typeof radiusTokens.radius;
export type ComponentRadius = keyof typeof radiusTokens.component;