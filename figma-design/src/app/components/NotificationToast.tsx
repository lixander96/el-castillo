import React, { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner@2.0.3';
import { getNotificationIcon } from '../data/notificationsData';

// Simulated real-time notifications
const simulateRealTimeNotifications = (currentRole: string) => {
  const notifications = {
    visitante: [
      {
        title: 'Nuevo evento agregado',
        message: 'Se agregó "Taller de Fotografía" a la agenda',
        type: 'event' as const,
        delay: 15000
      }
    ],
    artista: [
      {
        title: '¡Nueva venta!',
        message: 'Alguien compró tu obra "Rostros de la Ciudad"',
        type: 'marketplace' as const,
        delay: 12000
      }
    ],
    cliente: [
      {
        title: 'Tu reserva fue aprobada',
        message: 'La reserva del Taller Creativo fue confirmada',
        type: 'reservation' as const,
        delay: 10000
      }
    ],
    operaciones: [
      {
        title: 'Nueva puja recibida',
        message: 'Se recibió una puja de $45.000 para reserva #2',
        type: 'bid' as const,
        delay: 8000
      }
    ],
    admin: [
      {
        title: 'Pico de actividad',
        message: 'Se registraron 23 transacciones en los últimos 5 minutos',
        type: 'system' as const,
        delay: 20000
      }
    ]
  };

  return notifications[currentRole as keyof typeof notifications] || [];
};

export const NotificationToast: React.FC = () => {
  const { currentRole } = useApp();

  useEffect(() => {
    const notificationsToShow = simulateRealTimeNotifications(currentRole);
    const timeouts: NodeJS.Timeout[] = [];

    notificationsToShow.forEach((notification) => {
      const timeout = setTimeout(() => {
        toast.info(notification.title, {
          description: notification.message,
          icon: getNotificationIcon(notification.type),
          duration: 5000,
          action: {
            label: 'Ver',
            onClick: () => {
              // Could navigate to notifications or specific module
              console.log('Navigate to notification details');
            }
          }
        });
      }, notification.delay);

      timeouts.push(timeout);
    });

    // Cleanup timeouts on role change or unmount
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [currentRole]);

  return null; // This component doesn't render anything visual
};

// Hook to trigger custom notifications
export const useNotificationToast = () => {
  const showNotification = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    icon?: string
  ) => {
    const toastFunction = {
      success: toast.success,
      error: toast.error,
      info: toast.info,
      warning: toast.warning
    }[type];

    toastFunction(title, {
      description: message,
      icon: icon,
      duration: 4000
    });
  };

  const showPaymentSuccess = (eventTitle: string, amount: number) => {
    toast.success('¡Pago exitoso!', {
      description: `Tu entrada para "${eventTitle}" fue confirmada. Total: $${amount.toLocaleString()}`,
      icon: '💳',
      duration: 6000,
      action: {
        label: 'Ver ticket',
        onClick: () => console.log('Navigate to ticket')
      }
    });
  };

  const showReservationUpdate = (status: 'confirmed' | 'rejected', spaceName: string) => {
    const isConfirmed = status === 'confirmed';
    const toastFunction = isConfirmed ? toast.success : toast.error;
    
    toastFunction(
      isConfirmed ? 'Reserva confirmada' : 'Reserva rechazada',
      {
        description: `Tu reserva de ${spaceName} fue ${isConfirmed ? 'aprobada' : 'rechazada'}`,
        icon: isConfirmed ? '✅' : '❌',
        duration: 5000
      }
    );
  };

  const showBidUpdate = (type: 'new' | 'accepted' | 'rejected', amount: number) => {
    const messages = {
      new: 'Nueva puja recibida',
      accepted: 'Puja aceptada',
      rejected: 'Puja rechazada'
    };

    const colors = {
      new: toast.info,
      accepted: toast.success,
      rejected: toast.error
    };

    colors[type](messages[type], {
      description: `Monto: $${amount.toLocaleString()}`,
      icon: '💰',
      duration: 5000
    });
  };

  return {
    showNotification,
    showPaymentSuccess,
    showReservationUpdate,
    showBidUpdate
  };
};