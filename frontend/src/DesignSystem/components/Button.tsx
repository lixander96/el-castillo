/**
 * Button Component - Design System
 * Componente de botón atómico con múltiples variantes
 */

import React from 'react';
import { cn } from '../../components/ui/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante visual del botón
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'outline';
  
  /**
   * Tamaño del botón
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Tono de color para contextos específicos
   * @default 'default'
   */
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
  
  /**
   * Estado de carga
   */
  loading?: boolean;
  
  /**
   * Forma del botón
   * @default 'rounded'
   */
  shape?: 'rounded' | 'pill' | 'square';
  
  /**
   * Ancho completo
   */
  fullWidth?: boolean;
  
  /**
   * Ícono a la izquierda
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícono a la derecha
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Solo ícono (sin texto)
   */
  iconOnly?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    tone = 'default',
    shape = 'rounded',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    disabled,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = [
      'inline-flex items-center justify-center',
      'font-medium transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'active:scale-[0.98]',
    ];

    // Variant styles
    const variantStyles = {
      primary: [
        'bg-primary text-primary-foreground',
        'hover:bg-primary/90',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-secondary text-secondary-foreground',
        'hover:bg-secondary/80',
        'shadow-sm hover:shadow-md',
      ],
      tertiary: [
        'bg-transparent text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
      ],
      destructive: [
        'bg-destructive text-destructive-foreground',
        'hover:bg-destructive/90',
        'shadow-sm hover:shadow-md',
      ],
      ghost: [
        'bg-transparent text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
      ],
      outline: [
        'border border-input bg-background text-foreground',
        'hover:bg-accent hover:text-accent-foreground',
        'shadow-sm hover:shadow-md',
      ],
    };

    // Size styles
    const sizeStyles = {
      xs: [
        iconOnly ? 'h-6 w-6' : 'h-6 px-2',
        'text-xs',
        'gap-1',
      ],
      sm: [
        iconOnly ? 'h-8 w-8' : 'h-8 px-3',
        'text-sm',
        'gap-1.5',
      ],
      md: [
        iconOnly ? 'h-10 w-10' : 'h-10 px-4',
        'text-sm',
        'gap-2',
      ],
      lg: [
        iconOnly ? 'h-11 w-11' : 'h-11 px-6',
        'text-base',
        'gap-2',
      ],
      xl: [
        iconOnly ? 'h-12 w-12' : 'h-12 px-8',
        'text-base',
        'gap-2.5',
      ],
    };

    // Shape styles
    const shapeStyles = {
      rounded: 'rounded-md',
      pill: 'rounded-full',
      square: 'rounded-none',
    };

    // Tone modifier styles
    const toneStyles = {
      default: {},
      success: {
        primary: 'bg-green-600 hover:bg-green-700 text-white',
        secondary: 'bg-green-100 hover:bg-green-200 text-green-800',
        outline: 'border-green-300 text-green-700 hover:bg-green-50',
      },
      warning: {
        primary: 'bg-amber-600 hover:bg-amber-700 text-white',
        secondary: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
        outline: 'border-amber-300 text-amber-700 hover:bg-amber-50',
      },
      error: {
        primary: 'bg-red-600 hover:bg-red-700 text-white',
        secondary: 'bg-red-100 hover:bg-red-200 text-red-800',
        outline: 'border-red-300 text-red-700 hover:bg-red-50',
      },
      info: {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
        outline: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      },
    };

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Compile classes
    const buttonClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      shapeStyles[shape],
      fullWidth && 'w-full',
      loading && 'cursor-wait',
      tone !== 'default' && toneStyles[tone][variant as keyof typeof toneStyles[typeof tone]],
      className
    );

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {!iconOnly && children && (
          <span className={loading ? 'opacity-70' : ''}>{children}</span>
        )}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };