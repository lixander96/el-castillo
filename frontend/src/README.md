# ElCastilloBarracas — README Handoff

**Demo Frontend Completo** | Agenda de eventos, reservas, sistema de pujas, marketplace de artistas, gastronomía, streaming y panel administrativo con analítica.

---

## 🏗️ **Arquitectura General**

### Stack Tecnológico
- **Framework**: React 18 + TypeScript
- **Estilos**: Tailwind CSS v4.0 + Design System personalizado
- **Componentes**: Shadcn/UI + componentes atómicos custom
- **Estado**: Context API con mock data local
- **Build**: Modern ES modules

### Estructura del Proyecto
```
├── App.tsx                          # Entry point principal
├── contexts/AppContext.tsx          # Estado global y roles
├── data/                           # Mock data JSON
├── components/
│   ├── modules/                    # Módulos principales por área
│   ├── ui/                         # Componentes Shadcn/UI
│   └── [otros componentes core]
├── DesignSystem/                   # Tokens y componentes DS
└── styles/globals.css              # Tokens CSS y tema
```

---

## 🎨 **Design System & Tokens**

### Tokens de Color

#### **Semantic Colors**
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--primary` | `#030213` | `oklch(0.985 0 0)` | Acciones principales, botones CTA |
| `--secondary` | `oklch(0.95 0.0058 264.53)` | `oklch(0.269 0 0)` | Backgrounds secundarios |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` | Errores, eliminar |
| `--muted` | `#ececf0` | `oklch(0.269 0 0)` | Texto secundario, placeholders |
| `--accent` | `#e9ebef` | `oklch(0.269 0 0)` | Highlights, hover states |

#### **Brand Colors**
```typescript
brand: {
  castle: '#030213',    // Color principal del castillo
  barraca: '#717182',   // Color secundario barracas
  gold: '#f59e0b',      // Dorado para elementos premium
  silver: '#9ca3af',    // Plateado para elementos secundarios
}
```

### Tokens de Tipografía

#### **Font Families**
- **Sans**: Inter (principal)
- **Display**: Playfair Display (títulos)
- **Mono**: JetBrains Mono (código)

#### **Escala Tipográfica**
| Token | Size | Weight | Line Height | Uso |
|-------|------|--------|-------------|-----|
| `h1` | `3rem` (48px) | 700 | 1.25 | Títulos principales |
| `h2` | `2.25rem` (36px) | 600 | 1.25 | Títulos sección |
| `h3` | `1.875rem` (30px) | 600 | 1.375 | Subtítulos |
| `body.base` | `1rem` (16px) | 400 | 1.5 | Texto base |
| `body.small` | `0.875rem` (14px) | 400 | 1.5 | Texto secundario |

### Tokens de Espaciado

#### **Base Scale** (múltiplos de 4px)
```typescript
space: {
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  4: '1rem',       // 16px - base unit
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  12: '3rem',      // 48px
}
```

#### **Component Spacing**
| Componente | Padding X | Padding Y | Gap |
|------------|-----------|-----------|-----|
| Button SM | `0.75rem` | `0.375rem` | `0.375rem` |
| Button MD | `1rem` | `0.5rem` | `0.5rem` |
| Card MD | `1.5rem` | `1.5rem` | `1rem` |
| Input MD | `1rem` | `0.625rem` | - |

---

## 🧩 **Componentes & Props**

### Componentes Base (Shadcn/UI)

#### **Button**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}
```

#### **Card**
```typescript
interface CardProps {
  className?: string
  children: ReactNode
}
// Sub-componentes: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
```

#### **Badge**
```typescript
interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
}
```

### Componentes Custom

#### **DemoFAB**
```typescript
// FAB flotante para cambio de roles en demo
// Props: ninguna - usa contexto global
// Roles disponibles: publico, visitante, artista, cliente, operaciones, admin
```

#### **Navigation**
```typescript
interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}
// Incluye: menú responsive, avatar usuario, notificaciones, tema
```

#### **NotificationCenter**
```typescript
interface NotificationCenterProps {
  onNavigate: (tab: string) => void
}
// Maneja: badge unread, dropdown, filtros, acciones
```

#### **PaymentProcessor**
```typescript
interface PaymentProcessorProps {
  type: 'ticket' | 'artwork' | 'food' | 'reservation'
  itemId: string
  amount: number
  onSuccess: (result: PaymentResult) => void
  onError: (error: PaymentError) => void
}
```

---

## 📊 **Dataset Mock**

### **Usuarios (`mockUsers`)**
```typescript
interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}
```

**Usuarios disponibles:**
- Juan Visitante (visitante)
- Ana Artista (artista) 
- Carlos Cliente (cliente)
- Sofia Operaciones (operaciones)
- Miguel Admin (admin)

### **Eventos (`mockEvents`)**
```typescript
interface Event {
  id: string
  title: string
  description: string
  date: string          // YYYY-MM-DD
  time: string          // HH:MM
  space: string
  capacity: number
  ticketsSold: number
  price: number
  status: 'upcoming' | 'sold-out' | 'cancelled' | 'in-progress' | 'ended'
  image: string
  category: string
}
```

**6 eventos mock** con diferentes estados y categorías (Música, Arte, Taller, Entretenimiento).

### **Espacios (`mockSpaces`)**
```typescript
interface Space {
  id: string
  name: string
  capacity: number
  equipment: string[]
  pricePerHour: number
  image: string
}
```

**3 espacios disponibles:**
- Sala Principal (150 cap, $15.000/h)
- Galería Norte (80 cap, $8.000/h)  
- Taller Creativo (20 cap, $5.000/h)

### **Reservas (`mockReservations`)**
```typescript
interface Reservation {
  id: string
  userId: string
  spaceId: string
  eventType: string
  date: string
  duration: number
  attendees: number
  equipment: string[]
  catering?: boolean
  status: 'pending' | 'confirmed' | 'rejected'
  totalPrice: number
  createdAt: string
}
```

### **Pujas (`mockBids`)**
```typescript
interface Bid {
  id: string
  reservationId: string
  userId: string
  proposedAmount: number
  status: 'pending' | 'accepted' | 'rejected' | 'counter-offered'
  counterOffer?: number
  createdAt: string
}
```

### **Artistas & Obras (`mockArtists`, `mockArtworks`)**
```typescript
interface Artist {
  id: string
  name: string
  bio: string
  avatar: string
  artworks: number
  followers: number
}

interface Artwork {
  id: string
  artistId: string
  title: string
  description: string
  price: number
  category: string
  available: boolean
  image: string
  exclusiveContent?: boolean
}
```

### **Notificaciones (`mockNotifications`)**
Organizadas por rol con 8 tipos diferentes:
- `event`, `reservation`, `bid`, `marketplace`, `stream`, `gastronomy`, `system`, `payment`

---

## 🔄 **Flujos de Prototipo**

### **1. Sistema de Roles**
```
Público (sin loguear) → [Login/Register] → Usuario logueado
                     ↓
          [DemoFAB] → Cambio instantáneo de rol
```

**Visibilidad por rol:**
| Módulo | Público | Visitante | Artista | Cliente | Operaciones | Admin |
|--------|---------|-----------|---------|---------|-------------|-------|
| Agenda | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reservas | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Pujas | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Perfil | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Marketplace | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Gastronomía | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Streaming | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Notificaciones | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### **2. Flujo de Compra de Tickets**
```
Agenda → Seleccionar Evento → [Comprar Ticket] → PaymentProcessor → 
→ [MercadoPago/Stripe simulado] → Ticket con QR → Notificación éxito
```

### **3. Flujo de Reserva con Puja**
```
Reservas → Nueva Reserva → Seleccionar Espacio → Configurar → 
→ Seña 30% → [Si precio > umbral] → Sistema de Pujas → 
→ Contraoferta → Aprobación → Pago total → Confirmación
```

### **4. Flujo de Marketplace**
```
Marketplace → Explorar Obras → Seleccionar → [Comprar] → 
→ Pago (comisión 10%) → Transferencia a Artista → 
→ Descarga/Acceso Contenido → Notificaciones ambas partes
```

### **5. Flujo de Gastronomía**
```
Gastronomía → Ver Menú → Agregar al Carrito → [Pagar] → 
→ Orden en Cola → Notificación "Lista" → Retirar
```

---

## 🛠️ **Cómo usar el FAB DEMO**

### **Ubicación**
FAB flotante en esquina inferior derecha (fixed bottom-6 right-6).

### **Funcionalidades**

#### **1. Cambio de Roles**
- **Dropdown selector** con 6 roles disponibles
- **Indicador visual** con colores por rol:
  - 🔴 Admin (rojo)
  - 🟠 Operaciones (naranja) 
  - 🟢 Cliente (verde)
  - 🟣 Artista (púrpura)
  - 🔵 Visitante (azul)
  - ⚫ Público (gris)

#### **2. Acciones Rápidas**
```typescript
// Botones disponibles según rol actual
{
  "Cerrar sesión": currentRole !== 'publico',  // Vuelve a público
  "Reset Demo": true                           // Siempre disponible
}
```

#### **3. Cambios Automáticos**
Al cambiar rol se actualiza instantáneamente:
- ✅ Navegación visible/oculta
- ✅ Notificaciones específicas del rol
- ✅ Datos mock correspondientes
- ✅ Permisos de acceso a módulos
- ✅ Avatar y perfil de usuario

### **Testing Workflow**
1. **Empezar como Público** → Probar login modal
2. **Cambiar a Visitante** → Probar notificaciones básicas
3. **Cambiar a Cliente** → Probar flujo de compra/reserva
4. **Cambiar a Artista** → Probar marketplace y streams
5. **Cambiar a Operaciones** → Probar gestión de reservas
6. **Cambiar a Admin** → Probar dashboard y analytics

---

## ✅ **Checklist por Área**

### **🎭 Eventos (Agenda)**

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| ✅ **Listado de eventos** | Completo | Grid responsive, filtros por categoría |
| ✅ **Detalles de evento** | Completo | Modal con info completa, mapa de asientos |
| ✅ **Compra de tickets** | Completo | PaymentProcessor, QR code, email confirmación |
| ✅ **Estados de evento** | Completo | Upcoming, sold-out, cancelled, in-progress, ended |
| ✅ **Filtros y búsqueda** | Completo | Por fecha, categoría, precio, disponibilidad |
| ✅ **Vista calendario** | Completo | Calendario mensual con eventos |
| ✅ **Responsive design** | Completo | Mobile, tablet, desktop |
| ✅ **Notificaciones** | Completo | Nuevos eventos, entradas agotadas, recordatorios |

**Datos Mock**: 6 eventos variados, diferentes estados y categorías

---

### **🍽️ Gastronomía**

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| ✅ **Menú digital** | Completo | Categorías, precios, disponibilidad |
| ✅ **Carrito de compras** | Completo | Agregar/quitar, cantidades, total |
| ✅ **Sistema de pedidos** | Completo | Orden número, tiempo estimado |
| ✅ **Estados de orden** | Completo | Pendiente, preparando, lista, entregada |
| ✅ **Pago integrado** | Completo | MercadoPago/Stripe simulado |
| ✅ **Notificaciones orden** | Completo | Confirmación, listo para retirar |
| ✅ **Horarios disponibilidad** | Completo | Items no disponibles fuera de horario |
| ✅ **Historial pedidos** | Completo | Para usuarios logueados |

**Datos Mock**: 
- **Menu Items**: 15+ items variados con categorías
- **Orders**: Estados diferentes, timestamps realistas
- **Notificaciones**: Sistema completo por rol

---

### **🎨 Marketplace**

| Funcionalidad | Estado | Notas |
|---------------|--------|-------|
| ✅ **Galería de obras** | Completo | Grid masonry, filtros por artista/precio |
| ✅ **Perfiles de artistas** | Completo | Bio, portfolio, seguidores, estadísticas |
| ✅ **Compra de obras** | Completo | Pago, comisión 10%, transferencia a artista |
| ✅ **Contenido exclusivo** | Completo | NFTs, descargas premium, acceso especial |
| ✅ **Sistema de comisiones** | Completo | 10% retención automática, reportes |
| ✅ **Búsqueda avanzada** | Completo | Por artista, categoría, rango precio |
| ✅ **Favoritos/Wishlist** | Completo | Guardado por usuario, notificaciones precio |
| ✅ **Analytics artista** | Completo | Ventas, views, engagement |

**Datos Mock**:
- **Artists**: 5+ artistas con portfolios completos
- **Artworks**: 20+ obras variadas, diferentes precios
- **Orders**: Historial de compras con comisiones
- **Analytics**: Métricas realistas de ventas

---

## 🔧 **Configuración y Deployment**

### **Variables de Entorno**
```bash
# Demo mode (siempre true para este prototipo)
DEMO_MODE=true

# Payment processors (mock)
MERCADOPAGO_PUBLIC_KEY=TEST_12345...
STRIPE_PUBLISHABLE_KEY=pk_test_12345...

# Theme
DEFAULT_THEME=dark
```

### **Scripts Disponibles**
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Build producción
npm run preview      # Preview del build
npm run type-check   # Verificación TypeScript
```

### **Responsive Breakpoints**
```css
/* Targets específicos */
mobile: 375×812     /* iPhone 12/13/14 */
tablet: 768×1024    /* iPad */
desktop: 1440×900   /* Standard desktop */
```

---

## 📝 **Notas de Implementación**

### **Limitaciones del Demo**
- ❌ **Sin backend real**: Todos los datos son mock/simulados
- ❌ **Sin persistencia**: Los cambios se pierden al recargar
- ❌ **Sin APIs reales**: Integraciones de pago simuladas
- ❌ **Sin uploads**: Imágenes vienen de Unsplash

### **Para Implementación Real**
1. **Backend API**: Implementar endpoints REST/GraphQL
2. **Base de datos**: PostgreSQL/MongoDB para persistencia
3. **Autenticación**: Auth0, Firebase Auth, o custom JWT
4. **Pagos reales**: Integrar MercadoPago/Stripe production
5. **File upload**: Cloudinary, AWS S3, o similar
6. **Real-time**: WebSockets para notificaciones live

### **Consideraciones de Seguridad**
- 🔒 **PII Protection**: No colectar datos sensibles en demo
- 🔒 **API Keys**: Usar variables de entorno en producción
- 🔒 **Validation**: Validar inputs en cliente y servidor
- 🔒 **CORS**: Configurar correctamente para dominio final

---

## 📞 **Contacto & Soporte**

**Proyecto**: ElCastilloBarracas Demo Frontend  
**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025  

**Stack**: React 18 + TypeScript + Tailwind v4 + Shadcn/UI  
**Estado**: ✅ Demo completo listo para handoff

---

*Este README documenta una aplicación de demostración completa. Todos los datos son ficticios y las integraciones están simuladas para propósitos de prototipado.*