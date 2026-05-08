/**
 * Modal Component - Design System
 * Componente de modal atómico con overlay y contenido composable
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../components/ui/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  /**
   * Estado abierto/cerrado del modal
   */
  open: boolean;
  
  /**
   * Callback para cerrar el modal
   */
  onClose: () => void;
  
  /**
   * Tamaño del modal
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Posición del modal
   * @default 'center'
   */
  position?: 'center' | 'top' | 'bottom';
  
  /**
   * Cerrar al hacer click en el overlay
   * @default true
   */
  closeOnOverlayClick?: boolean;
  
  /**
   * Cerrar con tecla Escape
   * @default true
   */
  closeOnEscape?: boolean;
  
  /**
   * Mostrar botón de cerrar
   * @default true
   */
  showCloseButton?: boolean;
  
  /**
   * Título del modal
   */
  title?: string;
  
  /**
   * Descripción del modal
   */
  description?: string;
  
  /**
   * Contenido del modal
   */
  children: React.ReactNode;
  
  /**
   * Contenido del footer del modal
   */
  footer?: React.ReactNode;
  
  /**
   * Clase CSS adicional para el contenido
   */
  className?: string;
  
  /**
   * Clase CSS adicional para el overlay
   */
  overlayClassName?: string;
  
  /**
   * Z-index personalizado
   */
  zIndex?: number;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'md',
  position = 'center',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  description,
  children,
  footer,
  className,
  overlayClassName,
  zIndex = 1050,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Size styles
  const sizeStyles = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  // Position styles
  const positionStyles = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
  };

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Handle body scroll lock
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Handle focus trap
  React.useEffect(() => {
    if (!open || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first element
    firstElement?.focus();

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Portal to body */}
      {createPortal(
        <div
          className={cn(
            'fixed inset-0 flex',
            positionStyles[position],
            overlayClassName
          )}
          style={{ zIndex }}
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            ref={modalRef}
            className={cn(
              'relative w-full mx-4 bg-background rounded-lg shadow-2xl',
              'animate-in fade-in-0 zoom-in-95 duration-200',
              sizeStyles[size],
              size === 'full' && 'h-full overflow-auto',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-foreground"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    onClick={onClose}
                    className="ml-4 shrink-0"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Content */}
            <div className={cn(
              'p-6',
              size === 'full' && 'flex-1 overflow-auto'
            )}>
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
                {footer}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

Modal.displayName = 'Modal';

export { Modal };