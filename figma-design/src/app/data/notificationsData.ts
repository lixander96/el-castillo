// Mock data for notifications system
import { UserRole } from './mockData';

export interface Notification {
  id: string;
  userId: string;
  type: 'event' | 'reservation' | 'bid' | 'marketplace' | 'stream' | 'gastronomy' | 'system' | 'payment';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: {
    eventId?: string;
    reservationId?: string;
    bidId?: string;
    artworkId?: string;
    orderId?: string;
    streamId?: string;
  };
}

// Mock notifications data organized by user role
export const mockNotifications: Record<UserRole, Notification[]> = {
  publico: [], // No notifications for public users
  visitante: [
    {
      id: 'n1',
      userId: '1',
      type: 'event',
      title: 'Nuevo evento disponible',
      message: 'Se agregó "Noche de Jazz Contemporáneo" a la agenda. ¡Conseguí tu entrada!',
      isRead: false,
      createdAt: '2025-09-23T10:30:00Z',
      priority: 'medium',
      actionUrl: '/agenda',
      metadata: { eventId: '1' }
    },
    {
      id: 'n2',
      userId: '1',
      type: 'event',
      title: 'Entradas agotadas',
      message: 'Las entradas para "Exposición de Arte Digital" se agotaron. Revisá otros eventos disponibles.',
      isRead: true,
      createdAt: '2025-09-22T15:45:00Z',
      priority: 'low',
      actionUrl: '/agenda'
    },
    {
      id: 'n3',
      userId: '1',
      type: 'stream',
      title: 'Stream en vivo',
      message: 'La "Masterclass de Jazz" comenzó. ¡Unite ahora!',
      isRead: false,
      createdAt: '2025-09-23T19:00:00Z',
      priority: 'high',
      actionUrl: '/streaming',
      metadata: { streamId: '2' }
    },
    {
      id: 'n4',
      userId: '1',
      type: 'system',
      title: 'Bienvenido a ElCastillo',
      message: 'Explorá eventos, reservá espacios y descubrí contenido exclusivo de artistas.',
      isRead: true,
      createdAt: '2025-09-20T09:00:00Z',
      priority: 'low'
    }
  ],

  artista: [
    {
      id: 'n5',
      userId: '2',
      type: 'marketplace',
      title: 'Nueva venta realizada',
      message: 'Tu obra "Reflexiones Digitales" fue adquirida por $85.000. ¡Felicitaciones!',
      isRead: false,
      createdAt: '2025-09-23T14:20:00Z',
      priority: 'high',
      actionUrl: '/marketplace',
      metadata: { artworkId: '1', orderId: '2' }
    },
    {
      id: 'n6',
      userId: '2',
      type: 'reservation',
      title: 'Reserva confirmada',
      message: 'Tu reserva del Taller Creativo para el workshop de arte fue aprobada.',
      isRead: false,
      createdAt: '2025-09-23T11:15:00Z',
      priority: 'medium',
      actionUrl: '/reservas',
      metadata: { reservationId: '3' }
    },
    {
      id: 'n7',
      userId: '2',
      type: 'stream',
      title: 'Stream programado',
      message: 'Tu stream "Proceso Creativo en Vivo" está programado para mañana a las 20:00.',
      isRead: true,
      createdAt: '2025-09-22T12:00:00Z',
      priority: 'medium',
      actionUrl: '/streaming',
      metadata: { streamId: '1' }
    },
    {
      id: 'n8',
      userId: '2',
      type: 'system',
      title: 'Perfil completado',
      message: 'Tu perfil de artista está completo. Los usuarios ya pueden ver tus obras.',
      isRead: true,
      createdAt: '2025-09-18T16:30:00Z',
      priority: 'low'
    }
  ],

  cliente: [
    {
      id: 'n9',
      userId: '3',
      type: 'payment',
      title: 'Pago procesado exitosamente',
      message: 'Tu entrada para "Noche de Jazz Contemporáneo" fue confirmada. Descargá tu ticket.',
      isRead: false,
      createdAt: '2025-09-23T13:45:00Z',
      priority: 'high',
      actionUrl: '/perfil',
      metadata: { eventId: '1', orderId: '1' }
    },
    {
      id: 'n10',
      userId: '3',
      type: 'bid',
      title: 'Contraoferta recibida',
      message: 'Recibiste una contraoferta de $55.000 para tu reserva del concierto privado.',
      isRead: false,
      createdAt: '2025-09-23T09:30:00Z',
      priority: 'high',
      actionUrl: '/pujas',
      metadata: { reservationId: '1', bidId: '1' }
    },
    {
      id: 'n11',
      userId: '3',
      type: 'reservation',
      title: 'Reserva pendiente de aprobación',
      message: 'Tu solicitud de reserva de la Sala Principal está siendo evaluada.',
      isRead: true,
      createdAt: '2025-09-22T18:00:00Z',
      priority: 'medium',
      actionUrl: '/reservas',
      metadata: { reservationId: '1' }
    },
    {
      id: 'n12',
      userId: '3',
      type: 'gastronomy',
      title: 'Orden lista para retirar',
      message: 'Tu pedido de empanadas artesanales está listo en el mostrador.',
      isRead: true,
      createdAt: '2025-09-23T12:15:00Z',
      priority: 'medium',
      actionUrl: '/gastronomia',
      metadata: { orderId: '3' }
    }
  ],

  operaciones: [
    {
      id: 'n13',
      userId: '4',
      type: 'reservation',
      title: 'Nueva reserva pendiente',
      message: 'Carlos Cliente solicitó reservar la Sala Principal. Requiere aprobación.',
      isRead: false,
      createdAt: '2025-09-23T10:00:00Z',
      priority: 'high',
      actionUrl: '/reservas',
      metadata: { reservationId: '1' }
    },
    {
      id: 'n14',
      userId: '4',
      type: 'bid',
      title: 'Nueva puja recibida',
      message: 'Se recibió una puja de $50.000 para la reserva de concierto privado.',
      isRead: false,
      createdAt: '2025-09-23T10:05:00Z',
      priority: 'high',
      actionUrl: '/pujas',
      metadata: { bidId: '1' }
    },
    {
      id: 'n15',
      userId: '4',
      type: 'event',
      title: 'Capacidad crítica',
      message: 'El evento "Noche de Jazz Contemporáneo" alcanzó el 80% de su capacidad.',
      isRead: true,
      createdAt: '2025-09-23T08:30:00Z',
      priority: 'medium',
      actionUrl: '/agenda',
      metadata: { eventId: '1' }
    },
    {
      id: 'n16',
      userId: '4',
      type: 'system',
      title: 'Reporte diario disponible',
      message: 'El reporte de actividades del día está listo para revisar.',
      isRead: true,
      createdAt: '2025-09-23T07:00:00Z',
      priority: 'low',
      actionUrl: '/dashboard'
    }
  ],

  admin: [
    {
      id: 'n17',
      userId: '5',
      type: 'payment',
      title: 'Pico de transacciones',
      message: 'Se procesaron 47 pagos en la última hora. Ingresos: $234.500',
      isRead: false,
      createdAt: '2025-09-23T14:00:00Z',
      priority: 'high',
      actionUrl: '/dashboard'
    },
    {
      id: 'n18',
      userId: '5',
      type: 'system',
      title: 'Actualización de sistema',
      message: 'El sistema de pagos fue actualizado exitosamente. Nuevas funcionalidades disponibles.',
      isRead: false,
      createdAt: '2025-09-23T12:00:00Z',
      priority: 'medium'
    },
    {
      id: 'n19',
      userId: '5',
      type: 'marketplace',
      title: 'Comisiones del día',
      message: 'Se generaron $8.500 en comisiones de marketplace hoy.',
      isRead: true,
      createdAt: '2025-09-23T11:00:00Z',
      priority: 'medium',
      actionUrl: '/dashboard'
    },
    {
      id: 'n20',
      userId: '5',
      type: 'event',
      title: 'Evento agotado',
      message: 'La "Exposición de Arte Digital" se agotó completamente.',
      isRead: true,
      createdAt: '2025-09-22T20:00:00Z',
      priority: 'low',
      actionUrl: '/agenda',
      metadata: { eventId: '2' }
    },
    {
      id: 'n21',
      userId: '5',
      type: 'system',
      title: 'Backup completado',
      message: 'La copia de seguridad diaria se completó exitosamente.',
      isRead: true,
      createdAt: '2025-09-23T06:00:00Z',
      priority: 'low'
    }
  ]
};

// Helper functions
export const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    event: '🎭',
    reservation: '📅',
    bid: '💰',
    marketplace: '🎨',
    stream: '📺',
    gastronomy: '🍽️',
    system: '⚙️',
    payment: '💳'
  };
  return icons[type] || '📢';
};

export const getNotificationColor = (priority: Notification['priority']) => {
  const colors = {
    low: 'text-muted-foreground',
    medium: 'text-blue-500',
    high: 'text-red-500'
  };
  return colors[priority];
};

export const formatNotificationTime = (createdAt: string) => {
  const now = new Date();
  const notificationTime = new Date(createdAt);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Ahora';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
  return `${Math.floor(diffInMinutes / 1440)}d`;
};