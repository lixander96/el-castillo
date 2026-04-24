/**
 * ElCastilloBarracas Design System
 * Sistema de diseño completo con tokens y componentes atómicos
 */

// Design Tokens
export { colorTokens } from './tokens/colors';
export { typographyTokens } from './tokens/typography';
export { spacingTokens } from './tokens/spacing';
export { radiusTokens } from './tokens/radius';
export { elevationTokens } from './tokens/elevation';
export { stateTokens } from './tokens/states';

// Type exports for tokens
export type {
  ColorToken,
  SemanticColor,
  ColorShade,
} from './tokens/colors';

export type {
  TypographyToken,
  FontFamily,
  FontSize,
  FontWeight,
} from './tokens/typography';

export type {
  SpacingToken,
  SpaceScale,
  ComponentSpacing,
} from './tokens/spacing';

export type {
  RadiusToken,
  RadiusScale,
  ComponentRadius,
} from './tokens/radius';

export type {
  ElevationToken,
  ShadowScale,
  ZIndexScale,
} from './tokens/elevation';

export type {
  StateToken,
  InteractiveState,
  ValidationState,
} from './tokens/states';

// Atomic Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/Card';
export type {
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
} from './components/Card';

export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

// Design System Constants
export const DESIGN_SYSTEM_VERSION = '1.0.0';

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1440,
} as const;

export const DESIGN_SYSTEM_CONFIG = {
  name: 'ElCastilloBarracas Design System',
  version: DESIGN_SYSTEM_VERSION,
  breakpoints: BREAKPOINTS,
  defaultTheme: 'dark',
  supportedThemes: ['light', 'dark'],
  colorAccessibility: 'AA', // WCAG AA compliance
} as const;

// Utility functions for working with design tokens
export const getColorValue = (path: string, theme: 'light' | 'dark' = 'dark') => {
  // Helper function to get color values from tokens
  // Example usage: getColorValue('semantic.primary.600')
  return `var(--color-${path.replace(/\./g, '-')}-${theme})`;
};

export const getSpacingValue = (scale: keyof typeof spacingTokens.space) => {
  return spacingTokens.space[scale];
};

export const getTypographyValue = (
  category: keyof typeof typographyTokens,
  property?: string
) => {
  const token = typographyTokens[category];
  return property && typeof token === 'object' 
    ? (token as any)[property] 
    : token;
};

// Theme provider utilities
export const createThemeClasses = (theme: 'light' | 'dark') => {
  return theme === 'dark' ? 'dark' : '';
};

// Component variant utilities
export const createVariantClasses = (
  component: string,
  variant: string,
  size?: string,
  state?: string
) => {
  const classes = [`${component}--${variant}`];
  
  if (size) classes.push(`${component}--${size}`);
  if (state) classes.push(`${component}--${state}`);
  
  return classes.join(' ');
};