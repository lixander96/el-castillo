/**
 * Avatar Component - Design System
 * Componente de avatar atómico para representar usuarios
 */

import React from 'react';
import { cn } from '../../components/ui/utils';
import { User } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * URL de la imagen del avatar
   */
  src?: string;
  
  /**
   * Texto alternativo para la imagen
   */
  alt?: string;
  
  /**
   * Iniciales del usuario como fallback
   */
  initials?: string;
  
  /**
   * Tamaño del avatar
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  
  /**
   * Forma del avatar
   * @default 'circle'
   */
  shape?: 'circle' | 'square' | 'rounded';
  
  /**
   * Estado online/offline
   */
  status?: 'online' | 'offline' | 'away' | 'busy';
  
  /**
   * Mostrar indicador de estado
   */
  showStatus?: boolean;
  
  /**
   * Avatar clickeable
   */
  clickable?: boolean;
  
  /**
   * Callback onClick
   */
  onClick?: () => void;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt,
    initials,
    size = 'md',
    shape = 'circle',
    status,
    showStatus = false,
    clickable = false,
    onClick,
    ...props
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    // Base styles
    const baseStyles = [
      'relative inline-flex items-center justify-center overflow-hidden',
      'bg-muted text-muted-foreground',
      'transition-all duration-200',
      clickable && [
        'cursor-pointer hover:opacity-80',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      ],
    ];

    // Size styles
    const sizeStyles = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    // Shape styles
    const shapeStyles = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg',
    };

    // Status indicator styles
    const statusStyles = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    // Status indicator sizes
    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-3.5 w-3.5',
      '2xl': 'h-4 w-4',
    };

    // Icon sizes
    const iconSizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
      '2xl': 'h-10 w-10',
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    const handleImageLoad = () => {
      setImageError(false);
      setImageLoaded(true);
    };

    const showImage = src && !imageError;
    const showInitials = !showImage && initials;
    const showFallbackIcon = !showImage && !initials;

    const avatarClasses = cn(
      baseStyles,
      sizeStyles[size],
      shapeStyles[shape],
      className
    );

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={avatarClasses}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (clickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {/* Image */}
        {showImage && (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className={cn(
              'h-full w-full object-cover transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}

        {/* Initials */}
        {showInitials && (
          <span className="font-medium uppercase select-none">
            {initials}
          </span>
        )}

        {/* Fallback Icon */}
        {showFallbackIcon && (
          <User className={iconSizes[size]} />
        )}

        {/* Status Indicator */}
        {showStatus && status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              statusStyles[status],
              statusSizes[size]
            )}
            aria-label={`Status: ${status}`}
          />
        )}

        {/* Loading state */}
        {showImage && !imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };