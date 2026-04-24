/**
 * Card Component - Design System
 * Componente de tarjeta atómico con múltiples variantes y elementos composables
 */

import React from 'react';
import { cn } from '../../components/ui/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Variante visual de la card
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  
  /**
   * Tamaño del padding interno
   * @default 'md'
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Estado interactivo de la card
   */
  interactive?: boolean;
  
  /**
   * Estado seleccionado
   */
  selected?: boolean;
  
  /**
   * Estado deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Callback onClick
   */
  onClick?: () => void;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding = 'md',
    interactive = false,
    selected = false,
    disabled = false,
    onClick,
    children,
    ...props
  }, ref) => {
    // Base styles
    const baseStyles = [
      'rounded-lg transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    ];

    // Variant styles
    const variantStyles = {
      default: [
        'bg-card text-card-foreground border border-border',
      ],
      elevated: [
        'bg-card text-card-foreground shadow-md',
        'hover:shadow-lg',
      ],
      outline: [
        'bg-transparent border-2 border-border',
        'hover:border-ring/50',
      ],
      ghost: [
        'bg-transparent',
        'hover:bg-accent/50',
      ],
    };

    // Padding styles
    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
    };

    // Interactive states
    const interactiveStyles = interactive ? [
      'cursor-pointer',
      'hover:scale-[1.02]',
      'active:scale-[0.98]',
      selected && 'ring-2 ring-primary ring-offset-2',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
    ] : [];

    const cardClasses = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      interactiveStyles,
      className
    );

    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    const cardProps = {
      ref,
      className: cardClasses,
      onClick: interactive ? handleClick : undefined,
      tabIndex: interactive && !disabled ? 0 : undefined,
      role: interactive ? 'button' : undefined,
      'aria-disabled': disabled,
      'aria-selected': selected,
      ...props,
    };

    return <div {...cardProps}>{children}</div>;
  }
);

Card.displayName = 'Card';

// Card Header Component
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};