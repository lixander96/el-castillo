/**
 * Select Component - Design System
 * Componente de select atómico con múltiples variantes
 */

import React from 'react';
import { cn } from '../../components/ui/utils';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Opciones del select
   */
  options: SelectOption[];
  
  /**
   * Valor seleccionado
   */
  value?: string;
  
  /**
   * Callback cuando cambia el valor
   */
  onValueChange?: (value: string) => void;
  
  /**
   * Placeholder cuando no hay valor seleccionado
   */
  placeholder?: string;
  
  /**
   * Variante visual del select
   * @default 'default'
   */
  variant?: 'default' | 'filled' | 'outline' | 'ghost';
  
  /**
   * Tamaño del select
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
   * Label del select
   */
  label?: string;
  
  /**
   * Indica si el label es requerido
   */
  required?: boolean;
  
  /**
   * Estado deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Ancho completo
   * @default true
   */
  fullWidth?: boolean;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = 'Seleccionar...',
    variant = 'default',
    size = 'md',
    state = 'default',
    helpText,
    label,
    required = false,
    disabled = false,
    fullWidth = true,
    className,
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    // Generate unique ID
    const selectId = React.useId();

    // Find selected option
    const selectedOption = options.find(option => option.value === value);

    // Base styles
    const baseStyles = [
      'relative cursor-pointer transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ];

    // Trigger styles
    const triggerVariantStyles = {
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
      },
      warning: {
        ring: 'focus:ring-amber-500/50',
        border: 'border-amber-500 focus:border-amber-500',
      },
      error: {
        ring: 'focus:ring-red-500/50',
        border: 'border-red-500 focus:border-red-500',
      },
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isOpen && focusedIndex >= 0) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              onValueChange?.(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(!isOpen);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            const nextIndex = Math.min(focusedIndex + 1, options.length - 1);
            setFocusedIndex(nextIndex);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            const prevIndex = Math.max(focusedIndex - 1, 0);
            setFocusedIndex(prevIndex);
          }
          break;
      }
    };

    // Handle option click
    const handleOptionClick = (option: SelectOption) => {
      if (option.disabled) return;
      onValueChange?.(option.value);
      setIsOpen(false);
      setFocusedIndex(-1);
    };

    // Handle click outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll focused option into view
    React.useEffect(() => {
      if (isOpen && focusedIndex >= 0 && listRef.current) {
        const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
        focusedElement?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex, isOpen]);

    const triggerClasses = cn(
      baseStyles,
      triggerVariantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      state !== 'default' && [
        stateStyles[state].ring,
        stateStyles[state].border,
      ],
      'flex items-center justify-between gap-2',
      className
    );

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div ref={selectRef} className="relative">
          {/* Trigger */}
          <div
            ref={ref}
            id={selectId}
            className={triggerClasses}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            onKeyDown={handleKeyDown}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span className={cn(
              'flex-1 text-left truncate',
              !selectedOption && 'text-muted-foreground'
            )}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200 text-muted-foreground',
                isOpen && 'rotate-180'
              )}
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full">
              <ul
                ref={listRef}
                className={cn(
                  'max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-lg',
                  'animate-in fade-in-0 zoom-in-95'
                )}
                role="listbox"
              >
                {options.map((option, index) => (
                  <li
                    key={option.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      'focus:bg-accent focus:text-accent-foreground',
                      option.disabled && 'pointer-events-none opacity-50',
                      focusedIndex === index && 'bg-accent text-accent-foreground',
                      option.value === value && 'bg-accent text-accent-foreground'
                    )}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleOptionClick(option)}
                    onMouseEnter={() => setFocusedIndex(index)}
                  >
                    {option.label}
                    {option.value === value && (
                      <Check className="h-4 w-4 ml-auto" />
                    )}
                  </li>
                ))}
              </ul>
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

Select.displayName = 'Select';

export { Select };