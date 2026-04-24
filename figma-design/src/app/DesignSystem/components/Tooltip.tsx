/**
 * Tooltip Component - Design System
 * Componente de tooltip atómico con posicionamiento inteligente
 */

import React from 'react';
import { cn } from '../../components/ui/utils';

export interface TooltipProps {
  /**
   * Contenido del tooltip
   */
  content: React.ReactNode;
  
  /**
   * Elemento que activa el tooltip
   */
  children: React.ReactNode;
  
  /**
   * Posición preferida del tooltip
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  
  /**
   * Alineación del tooltip
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
  
  /**
   * Offset desde el elemento trigger
   * @default 8
   */
  offset?: number;
  
  /**
   * Delay antes de mostrar (ms)
   * @default 500
   */
  delayShow?: number;
  
  /**
   * Delay antes de ocultar (ms)
   * @default 0
   */
  delayHide?: number;
  
  /**
   * Deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Variante visual
   * @default 'default'
   */
  variant?: 'default' | 'dark' | 'light';
  
  /**
   * Tamaño del tooltip
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  offset = 8,
  delayShow = 500,
  delayHide = 0,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [actualSide, setActualSide] = React.useState(side);
  
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const showTimeoutRef = React.useRef<NodeJS.Timeout>();
  const hideTimeoutRef = React.useRef<NodeJS.Timeout>();

  // Variant styles
  const variantStyles = {
    default: 'bg-popover text-popover-foreground border border-border shadow-md',
    dark: 'bg-gray-900 text-white border-gray-800 shadow-lg',
    light: 'bg-white text-gray-900 border-gray-200 shadow-md',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs max-w-xs',
    md: 'px-3 py-1.5 text-sm max-w-sm',
    lg: 'px-4 py-2 text-base max-w-md',
  };

  // Calculate position
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let x = 0;
    let y = 0;
    let finalSide = side;

    // Calculate position based on side
    switch (side) {
      case 'top':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.top - tooltipRect.height - offset;
        
        // Check if tooltip would go outside viewport
        if (y < 0) {
          finalSide = 'bottom';
          y = triggerRect.bottom + offset;
        }
        break;
      
      case 'bottom':
        x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        y = triggerRect.bottom + offset;
        
        if (y + tooltipRect.height > viewport.height) {
          finalSide = 'top';
          y = triggerRect.top - tooltipRect.height - offset;
        }
        break;
      
      case 'left':
        x = triggerRect.left - tooltipRect.width - offset;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        
        if (x < 0) {
          finalSide = 'right';
          x = triggerRect.right + offset;
        }
        break;
      
      case 'right':
        x = triggerRect.right + offset;
        y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        
        if (x + tooltipRect.width > viewport.width) {
          finalSide = 'left';
          x = triggerRect.left - tooltipRect.width - offset;
        }
        break;
    }

    // Apply alignment
    if (finalSide === 'top' || finalSide === 'bottom') {
      if (align === 'start') {
        x = triggerRect.left;
      } else if (align === 'end') {
        x = triggerRect.right - tooltipRect.width;
      }
      
      // Keep within viewport bounds
      x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8));
    } else {
      if (align === 'start') {
        y = triggerRect.top;
      } else if (align === 'end') {
        y = triggerRect.bottom - tooltipRect.height;
      }
      
      // Keep within viewport bounds
      y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8));
    }

    setPosition({ x, y });
    setActualSide(finalSide);
  }, [side, align, offset]);

  // Show tooltip
  const showTooltip = React.useCallback(() => {
    if (disabled) return;
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
    
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);
  }, [disabled, delayShow]);

  // Hide tooltip
  const hideTooltip = React.useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }
    
    if (delayHide > 0) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, delayHide);
    } else {
      setIsVisible(false);
    }
  }, [delayHide]);

  // Update position when visible
  React.useEffect(() => {
    if (isVisible) {
      calculatePosition();
      
      const handleResize = () => calculatePosition();
      const handleScroll = () => calculatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeouts
  React.useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Arrow component
  const Arrow = () => {
    const arrowSize = 6;
    const arrowStyles = {
      top: `bottom-[-${arrowSize}px] left-1/2 -translate-x-1/2 border-l-[${arrowSize}px] border-r-[${arrowSize}px] border-t-[${arrowSize}px] border-l-transparent border-r-transparent border-t-current`,
      bottom: `top-[-${arrowSize}px] left-1/2 -translate-x-1/2 border-l-[${arrowSize}px] border-r-[${arrowSize}px] border-b-[${arrowSize}px] border-l-transparent border-r-transparent border-b-current`,
      left: `right-[-${arrowSize}px] top-1/2 -translate-y-1/2 border-t-[${arrowSize}px] border-b-[${arrowSize}px] border-l-[${arrowSize}px] border-t-transparent border-b-transparent border-l-current`,
      right: `left-[-${arrowSize}px] top-1/2 -translate-y-1/2 border-t-[${arrowSize}px] border-b-[${arrowSize}px] border-r-[${arrowSize}px] border-t-transparent border-b-transparent border-r-current`,
    };

    return (
      <div
        className={cn(
          'absolute w-0 h-0',
          arrowStyles[actualSide]
        )}
        style={{
          color: variant === 'dark' ? '#1f2937' : variant === 'light' ? '#ffffff' : 'hsl(var(--popover))',
        }}
      />
    );
  };

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && React.createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 rounded-md whitespace-pre-wrap break-words',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            variantStyles[variant],
            sizeStyles[size],
            className
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
          role="tooltip"
        >
          {content}
          <Arrow />
        </div>,
        document.body
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip };