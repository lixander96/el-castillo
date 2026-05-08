/**
 * Badge Component - Design System
 * Componente de badge atómico para mostrar estados, categorías y contadores
 */

import React from 'react';
import { cn } from '../../components/ui/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Variante visual del badge
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  
  /**
   * Tamaño del badge
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  
  /**
   * Forma del badge
   * @default 'rounded'
   */
  shape?: 'rounded' | 'pill' | 'square';
  
  /**
   * Ícono a la izquierda
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícono a la derecha
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Elemento a la derecha (ej: botón de cerrar)
   */
  rightElement?: React.ReactNode;
  
  /**
   * Badge como punto/dot (sin contenido)
   */
  dot?: boolean;
  
  /**
   * Contenido del badge (número para contadores)
   */
  count?: number;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    shape = 'rounded',
    leftIcon,
    rightIcon,
    rightElement,
    dot = false,
    count,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'bg-muted text-muted-foreground',
        'hover:bg-muted/80',
      ],
      primary: [
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
      ],
      secondary: [
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
      ],
      success: [
        'bg-green-500 text-white',
        'hover:bg-green-600',
      ],
      warning: [
        'bg-amber-500 text-white',
        'hover:bg-amber-600',
      ],
      error: [
        'bg-destructive text-destructive-foreground',
        'hover:bg-destructive/90',
      ],
      info: [
        'bg-blue-500 text-white',
        'hover:bg-blue-600',
      ],
      outline: [
        'border border-input bg-background text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
      ],
    };

    // Size styles
    const sizeStyles = {
      xs: [
        dot ? 'h-2 w-2' : 'h-4 px-1.5',
        'text-xs',
        'gap-1',
      ],
      sm: [
        dot ? 'h-2.5 w-2.5' : 'h-5 px-2',
        'text-xs',
        'gap-1',
      ],
      md: [
        dot ? 'h-3 w-3' : 'h-6 px-2.5',
        'text-sm',
        'gap-1.5',
      ],
      lg: [
        dot ? 'h-3.5 w-3.5' : 'h-7 px-3',
        'text-sm',
        'gap-1.5',
      ],
    };

    // Shape styles
    const shapeStyles = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none',
    };

    // Icon sizes based on badge size
    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-4 w-4',
    };

    // Handle count display
    const displayCount = count !== undefined ? (count > 99 ? '99+' : count.toString()) : undefined;
    const content = displayCount || children;

    // For dot badges, override some styles
    if (dot) {
      const dotClasses = cn(
        'inline-block rounded-full',
        sizeStyles[size][0], // Only take the size class
        variantStyles[variant],
        className
      );

      return (
        <span
          ref={ref}
          className={dotClasses}
          {...props}
        />
      );
    }

    // Compile classes
    const badgeClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      shapeStyles[shape],
      className
    );

    return (
      <span
        ref={ref}
        className={badgeClasses}
        {...props}
      >
        {leftIcon && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>
            {leftIcon}
          </span>
        )}
        
        {content && (
          <span className="flex-shrink-0">{content}</span>
        )}
        
        {rightIcon && (
          <span className={cn('flex-shrink-0', iconSizes[size])}>
            {rightIcon}
          </span>
        )}
        
        {rightElement && (
          <span className="flex-shrink-0 ml-1">
            {rightElement}
          </span>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };