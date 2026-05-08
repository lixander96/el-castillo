/**
 * Spacing Design Tokens
 * Sistema de espaciado para ElCastilloBarracas
 * Escala basada en múltiplos de 4px para consistencia
 */

export const spacingTokens = {
  // Base spacing scale (rem based)
  space: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px - base unit
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem',       // 384px
  },

  // Semantic spacing for different contexts
  component: {
    // Button spacing
    button: {
      paddingX: {
        sm: '0.75rem',     // 12px
        md: '1rem',        // 16px
        lg: '1.5rem',      // 24px
        xl: '2rem',        // 32px
      },
      paddingY: {
        sm: '0.375rem',    // 6px
        md: '0.5rem',      // 8px
        lg: '0.75rem',     // 12px
        xl: '1rem',        // 16px
      },
      gap: {
        sm: '0.375rem',    // 6px
        md: '0.5rem',      // 8px
        lg: '0.75rem',     // 12px
      },
    },

    // Input spacing
    input: {
      paddingX: {
        sm: '0.75rem',     // 12px
        md: '1rem',        // 16px
        lg: '1.25rem',     // 20px
      },
      paddingY: {
        sm: '0.5rem',      // 8px
        md: '0.625rem',    // 10px
        lg: '0.75rem',     // 12px
      },
    },

    // Card spacing
    card: {
      padding: {
        sm: '1rem',        // 16px
        md: '1.5rem',      // 24px
        lg: '2rem',        // 32px
        xl: '2.5rem',      // 40px
      },
      gap: {
        sm: '0.75rem',     // 12px
        md: '1rem',        // 16px
        lg: '1.5rem',      // 24px
      },
    },

    // Modal/Dialog spacing
    modal: {
      padding: {
        sm: '1.5rem',      // 24px
        md: '2rem',        // 32px
        lg: '2.5rem',      // 40px
      },
      gap: {
        sm: '1rem',        // 16px
        md: '1.5rem',      // 24px
        lg: '2rem',        // 32px
      },
    },

    // List item spacing
    listItem: {
      paddingX: {
        sm: '0.75rem',     // 12px
        md: '1rem',        // 16px
        lg: '1.5rem',      // 24px
      },
      paddingY: {
        sm: '0.5rem',      // 8px
        md: '0.75rem',     // 12px
        lg: '1rem',        // 16px
      },
      gap: {
        sm: '0.5rem',      // 8px
        md: '0.75rem',     // 12px
        lg: '1rem',        // 16px
      },
    },
  },

  // Layout spacing
  layout: {
    // Container spacing
    container: {
      paddingX: {
        mobile: '1rem',    // 16px
        tablet: '2rem',    // 32px
        desktop: '3rem',   // 48px
      },
      paddingY: {
        mobile: '1rem',    // 16px
        tablet: '1.5rem',  // 24px
        desktop: '2rem',   // 32px
      },
    },

    // Section spacing
    section: {
      marginY: {
        sm: '2rem',        // 32px
        md: '3rem',        // 48px
        lg: '4rem',        // 64px
        xl: '6rem',        // 96px
      },
      paddingY: {
        sm: '2rem',        // 32px
        md: '3rem',        // 48px
        lg: '4rem',        // 64px
        xl: '6rem',        // 96px
      },
    },

    // Grid spacing
    grid: {
      gap: {
        sm: '1rem',        // 16px
        md: '1.5rem',      // 24px
        lg: '2rem',        // 32px
        xl: '2.5rem',      // 40px
      },
    },

    // Stack spacing
    stack: {
      gap: {
        xs: '0.25rem',     // 4px
        sm: '0.5rem',      // 8px
        md: '0.75rem',     // 12px
        lg: '1rem',        // 16px
        xl: '1.5rem',      // 24px
        '2xl': '2rem',     // 32px
        '3xl': '2.5rem',   // 40px
      },
    },
  },

  // Responsive spacing
  responsive: {
    // Safe areas for mobile devices
    safeArea: {
      top: 'env(safe-area-inset-top)',
      right: 'env(safe-area-inset-right)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)',
    },

    // Breakpoint-specific spacing
    breakpoint: {
      mobile: {
        containerPadding: '1rem',
        sectionSpacing: '2rem',
        componentSpacing: '1rem',
      },
      tablet: {
        containerPadding: '2rem',
        sectionSpacing: '3rem',
        componentSpacing: '1.5rem',
      },
      desktop: {
        containerPadding: '3rem',
        sectionSpacing: '4rem',
        componentSpacing: '2rem',
      },
    },
  },
} as const;

export type SpacingToken = typeof spacingTokens;
export type SpaceScale = keyof typeof spacingTokens.space;
export type ComponentSpacing = keyof typeof spacingTokens.component;