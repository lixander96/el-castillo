/**
 * Input Component - Design System
 * Componente de input atómico con múltiples variantes y estados
 */

import React from 'react';
import { cn } from '../../components/ui/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Variante visual del input
   * @default 'default'
   */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  
  /**
   * Tamaño del input
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Estado de validación
   */
  state?: 'default' | 'success' | 'warning' | 'error';
  
  /**
   * Texto de ayuda o error
   */
  helpText?: string;
  
  /**
   * Label del input
   */
  label?: string;
  
  /**
   * Indica si el label es requerido
   */
  required?: boolean;
  
  /**
   * Ícono a la izquierda
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Ícono a la derecha
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Elemento personalizado a la izquierda (ej: prefix)
   */
  leftAddon?: React.ReactNode;
  
  /**
   * Elemento personalizado a la derecha (ej: suffix)
   */
  rightAddon?: React.ReactNode;
  
  /**
   * Ancho completo
   * @default true
   */
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    state = 'default',
    helpText,
    label,
    required = false,
    leftIcon,
    rightIcon,
    leftAddon,
    rightAddon,
    fullWidth = true,
    id,
    ...props
  }, ref) => {
    // Generate unique ID if not provided
    const inputId = id || React.useId();

    // Base styles
    const baseStyles = [
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-muted-foreground',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'border border-input bg-input-background',
        'hover:border-ring/50',
        'focus:border-ring',
      ],
      filled: [
        'border-0 bg-muted',
        'hover:bg-muted/80',
        'focus:bg-background focus:ring-2',
      ],
      outline: [
        'border-2 border-input bg-transparent',
        'hover:border-ring/50',
        'focus:border-ring',
      ],
      ghost: [
        'border-0 bg-transparent',
        'hover:bg-muted/50',
        'focus:bg-muted/50 focus:ring-2',
      ],
    };

    // Size styles
    const sizeStyles = {
      sm: [
        'h-8 px-3 text-sm',
        'rounded-md',
      ],
      md: [
        'h-10 px-3 text-sm',
        'rounded-md',
      ],
      lg: [
        'h-11 px-4 text-base',
        'rounded-lg',
      ],
    };

    // State styles
    const stateStyles = {
      default: {},
      success: {
        ring: 'focus:ring-green-500/50',
        border: 'border-green-500 focus:border-green-500',
        text: 'text-green-700',
      },
      warning: {
        ring: 'focus:ring-amber-500/50',
        border: 'border-amber-500 focus:border-amber-500',
        text: 'text-amber-700',
      },
      error: {
        ring: 'focus:ring-red-500/50',
        border: 'border-red-500 focus:border-red-500',
        text: 'text-red-700',
      },
    };

    // Container styles for icons/addons
    const hasLeftElement = leftIcon || leftAddon;
    const hasRightElement = rightIcon || rightAddon;

    const inputClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      hasLeftElement && {
        sm: 'pl-9',
        md: 'pl-10',
        lg: 'pl-12',
      }[size],
      hasRightElement && {
        sm: 'pr-9',
        md: 'pr-10',
        lg: 'pr-12',
      }[size],
      fullWidth && 'w-full',
      state !== 'default' && [
        stateStyles[state].ring,
        stateStyles[state].border,
      ],
      className
    );

    const iconSizes = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const iconPositions = {
      left: {
        sm: 'left-2.5',
        md: 'left-3',
        lg: 'left-3',
      },
      right: {
        sm: 'right-2.5',
        md: 'right-3',
        lg: 'right-3',
      },
    };

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
              iconPositions.left[size]
            )}>
              <span className={iconSizes[size]}>{leftIcon}</span>
            </div>
          )}

          {/* Left Addon */}
          {leftAddon && (
            <div className="absolute left-0 top-0 h-full flex items-center">
              {leftAddon}
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className={cn(
              'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
              iconPositions.right[size]
            )}>
              <span className={iconSizes[size]}>{rightIcon}</span>
            </div>
          )}

          {/* Right Addon */}
          {rightAddon && (
            <div className="absolute right-0 top-0 h-full flex items-center">
              {rightAddon}
            </div>
          )}
        </div>

        {/* Help Text */}
        {helpText && (
          <p className={cn(
            'text-xs',
            state === 'default' && 'text-muted-foreground',
            state === 'success' && 'text-green-600',
            state === 'warning' && 'text-amber-600',
            state === 'error' && 'text-red-600'
          )}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };