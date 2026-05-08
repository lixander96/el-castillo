// Mock data for ElCastilloBarracas demo
export type UserRole = 'publico' | 'visitante' | 'acceso' | 'artista' | 'cliente' | 'operaciones' | 'admin' | 'promotor';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
  sold: number;
  total: number;
  perks?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  space: string;
  capacity: number;
  ticketsSold: number;
  price: number;
  status: 'upcoming' | 'sold-out' | 'cancelled' | 'in-progress' | 'ended';
  image: string;
  category: string;
  ticketTypes: TicketType[];
  organizerId?: string; // ID del cliente organizador
  featured?: boolean; // Para eventos destacados en carousel
}

export interface Space {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  pricePerHour: number;
  image: string;
}

export interface Reservation {
  id: string;
  userId: string;
  spaceId: string;
  eventType: string;
  date: string;
  duration: number;
  attendees: number;
  equipment: string[];
  catering?: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  totalPrice: number;
  createdAt: string;
}

export interface Bid {
  id: string;
  reservationId: string;
  userId: string;
  proposedAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'counter-offered';
  counterOffer?: number;
  createdAt: string;
}

export interface Artwork {
  id: string;
  artistId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
  exclusiveContent?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  artworks: number;
  followers: number;
}

export interface Order {
  id: string;
  userId: string;
  type: 'ticket' | 'artwork' | 'food';
  itemId: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Stream {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  url: string;
  isLive: boolean;
  accessType: 'free' | 'premium';
  thumbnail: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  image: string;
}

// Mock Users
export const mockUsers: User[] = [
  { id: '1', firstName: 'Juan', lastName: 'Visitante', email: 'juan@email.com', role: 'visitante', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop' },
  { id: '1b', firstName: 'Lucia', lastName: 'Accesos', email: 'lucia@entrada.com', role: 'acceso', avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop' },
  { id: '2', firstName: 'Ana', lastName: 'Artista', email: 'ana@email.com', role: 'artista', avatar: 'https://images.unsplash.com/photo-1494790108755-2616c22eb23b?w=200&h=200&fit=crop' },
  { id: '3', firstName: 'Carlos', lastName: 'Cliente', email: 'carlos@email.com', role: 'cliente', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
  { id: '4', firstName: 'Sofia', lastName: 'Operaciones', email: 'sofia@email.com', role: 'operaciones', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop' },
  { id: '5', firstName: 'Miguel', lastName: 'Admin', email: 'miguel@email.com', role: 'admin', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop' },
  { id: '6', firstName: 'Lola', lastName: 'Promotora', email: 'lola@promo.com', role: 'promotor', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop' },
];

// Mock Spaces
export const mockSpaces: Space[] = [
  {
    id: '1',
    name: 'Sala Principal',
    capacity: 150,
    equipment: ['Sistema de sonido', 'Iluminación profesional', 'Proyector', 'Escenario'],
    pricePerHour: 15000,
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop'
  },
  {
    id: '2',
    name: 'Galería Norte',
    capacity: 80,
    equipment: ['Iluminación para arte', 'Sistema de seguridad', 'Climatización'],
    pricePerHour: 8000,
    image: 'https://images.unsplash.com/photo-1544967882-a2d18045c7e1?w=800&h=600&fit=crop'
  },
  {
    id: '3',
    name: 'Taller Creativo',
    capacity: 20,
    equipment: ['Mesas de trabajo', 'Herramientas básicas', 'Lavadero'],
    pricePerHour: 5000,
    image: 'https://images.unsplash.com/photo-1572907650073-7c8c9e9be6cc?w=800&h=600&fit=crop'
  }
];

// Mock Reservations
export const mockReservations: Reservation[] = [
  {
    id: '1',
    userId: '3',
    spaceId: '1',
    eventType: 'Concierto privado',
    date: '2025-11-15',
    duration: 4,
    attendees: 100,
    equipment: ['Sistema de sonido', 'Iluminación profesional'],
    catering: true,
    status: 'pending',
    totalPrice: 60000,
    createdAt: '2025-09-25T10:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    spaceId: '2',
    eventType: 'Exposición corporativa',
    date: '2025-11-20',
    duration: 6,
    attendees: 50,
    equipment: ['Iluminación para arte'],
    status: 'confirmed',
    totalPrice: 48000,
    createdAt: '2025-09-28T14:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    spaceId: '3',
    eventType: 'Workshop de arte',
    date: '2025-12-05',
    duration: 3,
    attendees: 15,
    equipment: ['Mesas de trabajo', 'Herramientas básicas'],
    catering: false,
    status: 'confirmed',
    totalPrice: 15000,
    createdAt: '2025-09-30T16:15:00Z'
  }
];

// Mock Bids
export const mockBids: Bid[] = [
  {
    id: '1',
    reservationId: '1',
    userId: '3',
    proposedAmount: 50000,
    status: 'pending',
    createdAt: '2025-09-25T10:05:00Z'
  },
  {
    id: '2',
    reservationId: '3',
    userId: '4',
    proposedAmount: 12000,
    status: 'counter-offered',
    counterOffer: 13500,
    createdAt: '2025-09-30T18:30:00Z'
  }
];

// Mock Artists
export const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Ana Martínez',
    bio: 'Artista digital especializada en instalaciones interactivas.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616c22eb23b?w=200&h=200&fit=crop',
    artworks: 12,
    followers: 340
  },
  {
    id: '2',
    name: 'Roberto Silva',
    bio: 'Pintor contemporáneo con enfoque en retratos urbanos.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    artworks: 8,
    followers: 280
  }
];

// Mock Artworks
export const mockArtworks: Artwork[] = [
  {
    id: '1',
    artistId: '1',
    title: 'Reflexiones Digitales',
    description: 'Instalación interactiva que explora la relación entre tecnología y humanidad.',
    price: 85000,
    category: 'Instalación',
    available: true,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    exclusiveContent: true
  },
  {
    id: '2',
    artistId: '2',
    title: 'Rostros de la Ciudad',
    description: 'Serie de retratos que capturan la diversidad urbana de Buenos Aires.',
    price: 65000,
    category: 'Pintura',
    available: true,
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop'
  }
];

// Mock Streams
export const mockStreams: Stream[] = [
  {
    id: '1',
    title: 'Proceso Creativo en Vivo',
    description: 'Observa el proceso de creación de una obra de arte en tiempo real.',
    scheduledAt: '2025-10-18T20:00:00Z',
    url: 'https://youtube.com/watch?v=demo',
    isLive: false,
    accessType: 'free',
    thumbnail: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=450&fit=crop'
  },
  {
    id: '2',
    title: 'Masterclass de Jazz',
    description: 'Clase magistral con músicos reconocidos del jazz argentino.',
    scheduledAt: '2025-10-22T19:00:00Z',
    url: 'https://youtube.com/watch?v=demo2',
    isLive: true,
    accessType: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=450&fit=crop'
  }
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Empanadas Artesanales',
    description: 'Empanadas caseras de carne, pollo y verdura',
    price: 2800,
    category: 'Entrada',
    available: true,
    image: 'https://images.unsplash.com/photo-1599621618989-8fa7b0b9dc9c?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Café de Especialidad',
    description: 'Blend exclusivo de granos seleccionados',
    price: 1500,
    category: 'Bebida',
    available: true,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '1',
    type: 'ticket',
    itemId: '1',
    amount: 8500,
    status: 'confirmed',
    createdAt: '2025-09-20T16:20:00Z'
  },
  {
    id: '2',
    userId: '3',
    type: 'artwork',
    itemId: '2',
    amount: 65000,
    status: 'pending',
    createdAt: '2025-09-22T11:45:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'food',
    itemId: '1',
    amount: 2800,
    status: 'confirmed',
    createdAt: '2025-09-23T14:30:00Z'
  }
];

// Dashboard Mock Data
export const mockDashboardData = {
  dailyTraffic: 1247,
  ticketsSold: 89,
  reservationsConfirmed: 12,
  dailyRevenue: 340500,
  monthlyRevenue: 8500000,
  cancelledReservations: 3,
  artworksSold: 7,
  foodConsumption: 145000,
  streamingEngagement: 68,

  // Chart data
  monthlyTraffic: [
    { month: 'Ene', value: 850 },
    { month: 'Feb', value: 1200 },
    { month: 'Mar', value: 980 },
    { month: 'Abr', value: 1100 },
    { month: 'May', value: 1350 },
    { month: 'Jun', value: 1247 }
  ],

  revenueByCategory: [
    { name: 'Eventos', value: 45 },
    { name: 'Reservas', value: 30 },
    { name: 'Marketplace', value: 15 },
    { name: 'Gastronomía', value: 10 }
  ]
};

