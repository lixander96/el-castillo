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
      message: 'Se agregÃ³ "Noche de Jazz ContemporÃ¡neo" a la agenda. Â¡ConseguÃ­ tu entrada!',
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
      message: 'Las entradas para "ExposiciÃ³n de Arte Digital" se agotaron. RevisÃ¡ otros eventos disponibles.',
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
      message: 'La "Masterclass de Jazz" comenzÃ³. Â¡Unite ahora!',
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
      message: 'ExplorÃ¡ eventos, reservÃ¡ espacios y descubrÃ­ contenido exclusivo de artistas.',
      isRead: true,
      createdAt: '2025-09-20T09:00:00Z',
      priority: 'low'
    }
  ],

  acceso: [
    {
      id: 'na1',
      userId: '1b',
      type: 'event',
      title: 'Puesto de acceso asignado',
      message: 'Hoy controlas el ingreso principal para "Noche de Jazz Contemporáneo".',
      isRead: false,
      createdAt: '2025-09-23T17:30:00Z',
      priority: 'medium',
      actionUrl: '/agenda',
      metadata: { eventId: '1' }
    },
    {
      id: 'na2',
      userId: '1b',
      type: 'system',
      title: 'Recuerda validar tickets',
      message: 'Utiliza el escáner QR para marcar el ingreso de cada asistente.',
      isRead: true,
      createdAt: '2025-09-22T09:15:00Z',
      priority: 'low'
    }
  ],

  artista: [
    {
      id: 'n5',
      userId: '2',
      type: 'marketplace',
      title: 'Nueva venta realizada',
      message: 'Tu obra "Reflexiones Digitales" fue adquirida por $85.000. Â¡Felicitaciones!',
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
      message: 'Tu stream "Proceso Creativo en Vivo" estÃ¡ programado para maÃ±ana a las 20:00.',
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
      message: 'Tu perfil de artista estÃ¡ completo. Los usuarios ya pueden ver tus obras.',
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
      message: 'Tu entrada para "Noche de Jazz ContemporÃ¡neo" fue confirmada. DescargÃ¡ tu ticket.',
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
      title: 'Reserva pendiente de aprobaciÃ³n',
      message: 'Tu solicitud de reserva de la Sala Principal estÃ¡ siendo evaluada.',
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
      message: 'Tu pedido de empanadas artesanales estÃ¡ listo en el mostrador.',
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
      message: 'Carlos Cliente solicitÃ³ reservar la Sala Principal. Requiere aprobaciÃ³n.',
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
      message: 'Se recibiÃ³ una puja de $50.000 para la reserva de concierto privado.',
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
      title: 'Capacidad crÃ­tica',
      message: 'El evento "Noche de Jazz ContemporÃ¡neo" alcanzÃ³ el 80% de su capacidad.',
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
      message: 'El reporte de actividades del dÃ­a estÃ¡ listo para revisar.',
      isRead: true,
      createdAt: '2025-09-23T07:00:00Z',
      priority: 'low',
      actionUrl: '/dashboard'
    }
  ],
  promotor: [
    {
      id: 'np1',
      userId: '6',
      type: 'payment',
      title: 'Venta con cupón aplicada',
      message: 'Vendiste 8 tickets con el cupón CASTILLO10 en las últimas 24h.',
      isRead: false,
      createdAt: '2025-09-23T13:20:00Z',
      priority: 'high',
      actionUrl: '/cupones'
    },
    {
      id: 'np2',
      userId: '6',
      type: 'system',
      title: 'Objetivo semanal alcanzado',
      message: 'Alcanzaste el 75% de tu objetivo de ventas. Seguís sumando comisión.',
      isRead: false,
      createdAt: '2025-09-22T09:00:00Z',
      priority: 'medium',
      actionUrl: '/cupones'
    }
  ],

  admin: [
    {
      id: 'n17',
      userId: '5',
      type: 'payment',
      title: 'Pico de transacciones',
      message: 'Se procesaron 47 pagos en la Ãºltima hora. Ingresos: $234.500',
      isRead: false,
      createdAt: '2025-09-23T14:00:00Z',
      priority: 'high',
      actionUrl: '/dashboard'
    },
    {
      id: 'n18',
      userId: '5',
      type: 'system',
      title: 'ActualizaciÃ³n de sistema',
      message: 'El sistema de pagos fue actualizado exitosamente. Nuevas funcionalidades disponibles.',
      isRead: false,
      createdAt: '2025-09-23T12:00:00Z',
      priority: 'medium'
    },
    {
      id: 'n19',
      userId: '5',
      type: 'marketplace',
      title: 'Comisiones del dÃ­a',
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
      message: 'La "ExposiciÃ³n de Arte Digital" se agotÃ³ completamente.',
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
      message: 'La copia de seguridad diaria se completÃ³ exitosamente.',
      isRead: true,
      createdAt: '2025-09-23T06:00:00Z',
      priority: 'low'
    }
  ]
};

// Helper functions
export const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    event: 'ðŸŽ­',
    reservation: 'ðŸ“…',
    bid: 'ðŸ’°',
    marketplace: 'ðŸŽ¨',
    stream: 'ðŸ“º',
    gastronomy: 'ðŸ½ï¸',
    system: 'âš™ï¸',
    payment: 'ðŸ’³'
  };
  return icons[type] || 'ðŸ“¢';
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


