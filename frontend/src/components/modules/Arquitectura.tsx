import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Server, 
  Database, 
  Cloud, 
  Shield, 
  Smartphone, 
  Monitor,
  ArrowRight,
  Lock,
  Key,
  FileText,
  Users,
  Calendar,
  MapPin,
  ShoppingCart,
  Palette,
  Utensils,
  Video,
  BarChart3,
  Bell,
  DollarSign,
  Ticket,
  Timer,
  Gavel,
  Settings
} from 'lucide-react';

export const Arquitectura: React.FC = () => {
  const endpoints = [
    // Autenticación y Usuarios
    { method: 'POST', path: '/api/auth/login', description: 'Autenticar usuario' },
    { method: 'POST', path: '/api/auth/register', description: 'Registrar usuario' },
    { method: 'GET', path: '/api/auth/profile', description: 'Perfil del usuario' },
    { method: 'PUT', path: '/api/auth/profile', description: 'Actualizar perfil' },
    
    // Eventos y Tickets
    { method: 'GET', path: '/api/events', description: 'Listar eventos con filtros' },
    { method: 'POST', path: '/api/events', description: 'Crear evento (organizadores)' },
    { method: 'PUT', path: '/api/events/{id}', description: 'Actualizar evento' },
    { method: 'GET', path: '/api/events/{id}/stats', description: 'Estadísticas del evento' },
    { method: 'PUT', path: '/api/events/{id}/tickets', description: 'Actualizar disponibilidad tickets' },
    { method: 'POST', path: '/api/tickets/purchase', description: 'Comprar tickets' },
    { method: 'GET', path: '/api/tickets/user', description: 'Tickets del usuario' },
    { method: 'POST', path: '/api/tickets/validate', description: 'Validar QR en evento' },
    
    // Reservas y Espacios
    { method: 'GET', path: '/api/spaces', description: 'Listar espacios disponibles' },
    { method: 'POST', path: '/api/reservations', description: 'Crear reserva con seña' },
    { method: 'GET', path: '/api/reservations/user', description: 'Reservas del usuario' },
    { method: 'PUT', path: '/api/reservations/{id}', description: 'Actualizar estado reserva' },
    
    // Sistema de Pujas
    { method: 'GET', path: '/api/bids', description: 'Listar pujas activas' },
    { method: 'POST', path: '/api/bids', description: 'Crear nueva puja' },
    { method: 'PUT', path: '/api/bids/{id}', description: 'Actualizar/contraoferta puja' },
    { method: 'POST', path: '/api/bids/{id}/accept', description: 'Aceptar puja' },
    
    // Marketplace de Artistas
    { method: 'GET', path: '/api/artworks', description: 'Listar obras con filtros' },
    { method: 'POST', path: '/api/artworks', description: 'Publicar obra (artistas)' },
    { method: 'POST', path: '/api/artworks/{id}/purchase', description: 'Comprar obra' },
    { method: 'GET', path: '/api/artists', description: 'Directorio de artistas' },
    { method: 'GET', path: '/api/artists/{id}/portfolio', description: 'Portfolio del artista' },
    
    // Gastronomía
    { method: 'GET', path: '/api/menu', description: 'Menú y productos gastronómicos' },
    { method: 'POST', path: '/api/orders', description: 'Realizar pedido gastronómico' },
    { method: 'GET', path: '/api/orders/user', description: 'Pedidos del usuario' },
    { method: 'PUT', path: '/api/orders/{id}/status', description: 'Actualizar estado pedido' },
    
    // Streaming
    { method: 'GET', path: '/api/streams', description: 'Listar streams disponibles' },
    { method: 'POST', path: '/api/streams', description: 'Crear stream (organizadores)' },
    { method: 'GET', path: '/api/streams/{id}/access', description: 'Verificar acceso a stream' },
    { method: 'POST', path: '/api/streams/{id}/join', description: 'Unirse a stream' },
    
    // Notificaciones
    { method: 'GET', path: '/api/notifications', description: 'Notificaciones del usuario' },
    { method: 'PUT', path: '/api/notifications/{id}/read', description: 'Marcar como leída' },
    { method: 'POST', path: '/api/notifications/subscribe', description: 'Suscribir a notificaciones push' },
    
    // Pagos
    { method: 'POST', path: '/api/payments/create', description: 'Crear intención de pago' },
    { method: 'POST', path: '/api/payments/confirm', description: 'Confirmar pago' },
    { method: 'GET', path: '/api/payments/history', description: 'Historial de pagos' },
    { method: 'POST', path: '/api/payments/refund', description: 'Procesar reembolso' },
    
    // Analytics y Dashboard
    { method: 'GET', path: '/api/analytics/overview', description: 'Métricas generales' },
    { method: 'GET', path: '/api/analytics/events', description: 'Analítica de eventos' },
    { method: 'GET', path: '/api/analytics/revenue', description: 'Métricas de ingresos' },
    { method: 'GET', path: '/api/analytics/users', description: 'Comportamiento de usuarios' }
  ];

  const dataModels = [
    {
      name: 'Users',
      fields: [
        'id', 'email', 'name', 'role (visitante|artista|cliente|operaciones|admin)', 
        'avatar', 'phone', 'preferences', 'notification_settings', 
        'stripe_customer_id', 'mercadopago_customer_id', 'created_at', 'updated_at'
      ]
    },
    {
      name: 'Events',
      fields: [
        'id', 'title', 'description', 'date', 'time', 'space_id', 'organizer_id',
        'status (upcoming|sold-out|completed|cancelled)', 'image', 'category',
        'max_capacity', 'created_at', 'updated_at'
      ]
    },
    {
      name: 'Ticket_Types',
      fields: [
        'id', 'event_id', 'name', 'description', 'price', 'total_available',
        'sold_count', 'available_count', 'color', 'benefits', 'created_at'
      ]
    },
    {
      name: 'Tickets',
      fields: [
        'id', 'event_id', 'ticket_type_id', 'user_id', 'qr_code', 'price_paid',
        'purchase_date', 'status (confirmed|used|cancelled)', 'payment_id'
      ]
    },
    {
      name: 'Spaces',
      fields: [
        'id', 'name', 'description', 'capacity', 'hourly_rate', 'daily_rate',
        'amenities', 'images', 'availability_calendar', 'deposit_percentage'
      ]
    },
    {
      name: 'Reservations',
      fields: [
        'id', 'user_id', 'space_id', 'event_type', 'start_date', 'end_date',
        'total_hours', 'hourly_rate', 'deposit_amount', 'total_amount',
        'status (pending|confirmed|completed|cancelled)', 'payment_id'
      ]
    },
    {
      name: 'Bids',
      fields: [
        'id', 'reservation_id', 'bidder_id', 'original_amount', 'proposed_amount',
        'status (pending|accepted|rejected|countered)', 'counter_offer_amount',
        'message', 'expires_at', 'created_at'
      ]
    },
    {
      name: 'Artworks',
      fields: [
        'id', 'artist_id', 'title', 'description', 'price', 'category',
        'dimensions', 'materials', 'year', 'images', 'available',
        'commission_rate', 'featured', 'tags'
      ]
    },
    {
      name: 'Orders',
      fields: [
        'id', 'user_id', 'type (tickets|artwork|food|reservation)', 'item_id',
        'quantity', 'unit_price', 'total_amount', 'commission_amount',
        'status (pending|confirmed|completed|cancelled)', 'payment_method',
        'payment_id', 'created_at'
      ]
    },
    {
      name: 'Menu_Items',
      fields: [
        'id', 'name', 'description', 'price', 'category', 'image',
        'ingredients', 'allergens', 'available', 'preparation_time'
      ]
    },
    {
      name: 'Food_Orders',
      fields: [
        'id', 'user_id', 'items (JSON)', 'total_amount', 'delivery_type',
        'delivery_address', 'status (preparing|ready|delivered)', 'notes'
      ]
    },
    {
      name: 'Streams',
      fields: [
        'id', 'title', 'description', 'stream_url', 'thumbnail', 'organizer_id',
        'start_time', 'duration', 'access_type (free|paid)', 'price',
        'max_viewers', 'current_viewers', 'status (scheduled|live|ended)'
      ]
    },
    {
      name: 'Notifications',
      fields: [
        'id', 'user_id', 'type', 'title', 'message', 'data (JSON)',
        'read_at', 'action_url', 'priority (low|medium|high)', 'created_at'
      ]
    },
    {
      name: 'Payments',
      fields: [
        'id', 'user_id', 'order_id', 'amount', 'currency', 'provider',
        'provider_payment_id', 'status', 'metadata (JSON)', 'created_at'
      ]
    },
    {
      name: 'Analytics_Events',
      fields: [
        'id', 'event_type', 'user_id', 'session_id', 'properties (JSON)',
        'timestamp', 'ip_address', 'user_agent'
      ]
    }
  ];

  const businessLogic = [
    {
      module: 'Sistema de Roles',
      rules: [
        'Público: Solo visualización de eventos y espacios',
        'Visitante: Compra de tickets, reservas con seña 30%',
        'Artista: Marketplace con comisión 10%, portfolio',
        'Cliente: Organización de eventos, gestión de tickets',
        'Operaciones: Gestión de espacios, aprovación de reservas',
        'Admin: Acceso completo, dashboard analítico'
      ]
    },
    {
      module: 'Sistema de Tickets',
      rules: [
        'Múltiples tipos por evento (General, VIP, Preferencial)',
        'Control de disponibilidad en tiempo real',
        'QR único por ticket para validación',
        'Precios "Desde" basados en ticket más económico',
        'Estadísticas de ventas para organizadores'
      ]
    },
    {
      module: 'Sistema de Reservas',
      rules: [
        'Seña obligatoria del 30% para confirmar reserva',
        'Tarifas por hora con mínimo de tiempo',
        'Sistema de pujas para negociar precios',
        'Estados: Pendiente → Confirmada → Completada',
        'Calendario de disponibilidad por espacio'
      ]
    },
    {
      module: 'Sistema de Pujas',
      rules: [
        'Solo sobre reservas en estado "pendiente"',
        'Contraoferta permitida por el propietario',
        'Expiración automática en 48 horas',
        'Notificaciones en tiempo real',
        'Historial completo de negociación'
      ]
    },
    {
      module: 'Marketplace',
      rules: [
        'Comisión del 10% sobre ventas de artistas',
        'Portfolio público con galerías personalizadas',
        'Sistema de categorías y filtros avanzados',
        'Pagos divididos automáticamente',
        'Rating y reviews de compradores'
      ]
    },
    {
      module: 'Sistema de Pagos',
      rules: [
        'MercadoPago para mercado argentino',
        'Stripe para pagos internacionales',
        'División automática de comisiones',
        'Reembolsos parciales o totales',
        'Retry automático en fallos de pago'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1>Arquitectura del Sistema ElCastilloBarracas</h1>
        <p className="text-muted-foreground">
          Documentación técnica completa para la implementación del servidor y APIs
        </p>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Vista General del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">6 Roles de Usuario</h3>
              <p className="text-sm text-muted-foreground">Sistema de permisos granular</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Gestión de Eventos</h3>
              <p className="text-sm text-muted-foreground">Tickets múltiples + estadísticas</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Reservas con Pujas</h3>
              <p className="text-sm text-muted-foreground">Seña 30% + negociación</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Palette className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-medium">Marketplace</h3>
              <p className="text-sm text-muted-foreground">Comisión 10% + portfolios</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
              <h3 className="font-medium">Pagos Integrados</h3>
              <p className="text-sm text-muted-foreground">MercadoPago + Stripe</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground">Dashboard + métricas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Diagrama de Arquitectura</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Frontend Layer */}
            <div className="text-center">
              <h3 className="font-medium mb-4">Capa de Presentación</h3>
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Monitor className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="text-sm">Web App</span>
                  <Badge variant="outline">React + TypeScript</Badge>
                  <Badge variant="secondary" className="mt-1">Demo Actual</Badge>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Smartphone className="h-8 w-8 mb-2 text-green-600" />
                  <span className="text-sm">Mobile App</span>
                  <Badge variant="outline">React Native</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* API Gateway */}
            <div className="text-center">
              <h3 className="font-medium mb-4">API Gateway + Autenticación</h3>
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Server className="h-8 w-8 mb-2 text-purple-600" />
                  <span className="text-sm">Gateway</span>
                  <Badge variant="outline">Node.js + Express</Badge>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 mb-2 text-red-600" />
                  <span className="text-sm">Auth</span>
                  <Badge variant="outline">JWT + Role-based</Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Microservices */}
            <div className="text-center">
              <h3 className="font-medium mb-4">Microservicios Principales</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Calendar className="h-6 w-6 mb-2 text-blue-500" />
                  <span className="text-xs">Eventos + Tickets</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <MapPin className="h-6 w-6 mb-2 text-green-500" />
                  <span className="text-xs">Reservas + Pujas</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <DollarSign className="h-6 w-6 mb-2 text-orange-500" />
                  <span className="text-xs">Pagos</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Palette className="h-6 w-6 mb-2 text-purple-500" />
                  <span className="text-xs">Marketplace</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Utensils className="h-6 w-6 mb-2 text-red-500" />
                  <span className="text-xs">Gastronomía</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Video className="h-6 w-6 mb-2 text-cyan-500" />
                  <span className="text-xs">Streaming</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <Bell className="h-6 w-6 mb-2 text-yellow-500" />
                  <span className="text-xs">Notificaciones</span>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-lg">
                  <BarChart3 className="h-6 w-6 mb-2 text-pink-500" />
                  <span className="text-xs">Analytics</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Database Layer */}
            <div className="text-center">
              <h3 className="font-medium mb-4">Capa de Datos</h3>
              <div className="flex justify-center gap-4">
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Database className="h-8 w-8 mb-2 text-blue-600" />
                  <span className="text-sm">PostgreSQL</span>
                  <Badge variant="outline">Base de datos principal</Badge>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Server className="h-8 w-8 mb-2 text-red-600" />
                  <span className="text-sm">Redis</span>
                  <Badge variant="outline">Cache + Sesiones</Badge>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg">
                  <Cloud className="h-8 w-8 mb-2 text-green-600" />
                  <span className="text-sm">S3 / Cloudinary</span>
                  <Badge variant="outline">Archivos multimedia</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Logic */}
      <Card>
        <CardHeader>
          <CardTitle>Lógica de Negocio Implementada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {businessLogic.map((module, index) => (
              <div key={index}>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {module.module}
                </h4>
                <div className="pl-6 space-y-2">
                  {module.rules.map((rule, ruleIndex) => (
                    <div key={ruleIndex} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Endpoints API Requeridos ({endpoints.length} endpoints)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center gap-4 p-2 border rounded">
                <Badge 
                  variant={endpoint.method === 'GET' ? 'default' : 
                          endpoint.method === 'POST' ? 'destructive' : 'secondary'}
                  className="w-16 justify-center"
                >
                  {endpoint.method}
                </Badge>
                <code className="flex-1 text-sm font-mono">{endpoint.path}</code>
                <span className="text-sm text-muted-foreground">{endpoint.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Models */}
      <Card>
        <CardHeader>
          <CardTitle>Modelo de Datos Completo ({dataModels.length} tablas)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataModels.map((model, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {model.name}
                </h4>
                <div className="space-y-1">
                  {model.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="text-sm font-mono text-muted-foreground">
                      • {field}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* External Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones Externas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Procesamiento de Pagos</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">MercadoPago</Badge>
                  <span>Pagos locales Argentina + comisiones automáticas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Stripe</Badge>
                  <span>Pagos internacionales + split payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Webhooks</Badge>
                  <span>Confirmación automática de pagos</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Streaming de Video</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">YouTube Live API</Badge>
                  <span>Streams públicos gratuitos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Vimeo Live</Badge>
                  <span>Contenido premium con acceso pago</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Mux</Badge>
                  <span>Optimización y analytics de video</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Notificaciones</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">SendGrid</Badge>
                  <span>Email transaccional + marketing</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Firebase Cloud Messaging</Badge>
                  <span>Push notifications móviles</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">WebSockets</Badge>
                  <span>Notificaciones tiempo real web</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Almacenamiento y CDN</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">AWS S3</Badge>
                  <span>Archivos, backups, imágenes originales</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Cloudinary</Badge>
                  <span>Optimización automática de imágenes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">CloudFront</Badge>
                  <span>CDN para entrega rápida global</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Analytics y Monitoreo</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Google Analytics</Badge>
                  <span>Comportamiento de usuarios</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Mixpanel</Badge>
                  <span>Events tracking y funnels</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Sentry</Badge>
                  <span>Error tracking y performance</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Generación de QR y PDFs</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">QR Code Generator</Badge>
                  <span>QR únicos para tickets</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Puppeteer</Badge>
                  <span>Generación de tickets en PDF</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">Canvas API</Badge>
                  <span>Tickets personalizados con marca</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Seguridad & Privacidad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Autenticación y Autorización
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• JWT tokens con refresh automático</li>
                <li>• Sistema de roles granular (6 niveles)</li>
                <li>• 2FA opcional para operaciones y admin</li>
                <li>• OAuth social login (Google, Facebook)</li>
                <li>• Rate limiting por IP y usuario</li>
                <li>• Logs de auditoría de accesos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Key className="h-4 w-4" />
                Cifrado y Transmisión
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• TLS 1.3 para datos en tránsito</li>
                <li>• AES-256 para datos sensibles en reposo</li>
                <li>• Hashing bcrypt para contraseñas</li>
                <li>• Headers de seguridad OWASP</li>
                <li>• CORS configurado por dominio</li>
                <li>• CSP para prevenir XSS</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Privacidad y Cumplimiento
              </h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Cumplimiento GDPR europeo</li>
                <li>• Ley de Protección de Datos Argentina</li>
                <li>• Consentimiento granular de cookies</li>
                <li>• Derecho al olvido y portabilidad</li>
                <li>• Anonización de analytics</li>
                <li>• Política de retención de datos</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-3">Pagos y Transacciones</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• PCI-DSS compliance via Stripe/MP</li>
                <li>• Nunca almacenar datos de tarjetas</li>
                <li>• Tokenización de métodos de pago</li>
                <li>• Webhook signature validation</li>
                <li>• Timeout y retry en transacciones</li>
                <li>• Logs detallados de operaciones</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notas de Implementación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Estado Actual (Demo Frontend)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• ✅ Sistema completo de roles con mock data</li>
                <li>• ✅ Flujo de compra de tickets implementado</li>
                <li>• ✅ Gestión de eventos para organizadores</li>
                <li>• ✅ Sistema de reservas con pujas</li>
                <li>• ✅ Marketplace de artistas funcional</li>
                <li>• ✅ Dashboard con métricas simuladas</li>
                <li>• ✅ Notificaciones en tiempo real (mock)</li>
                <li>• ✅ Responsive design para móviles</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Próximos Pasos (Backend)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 🔄 Implementar todos los endpoints listados</li>
                <li>• 🔄 Configurar base de datos PostgreSQL</li>
                <li>• 🔄 Integrar MercadoPago y Stripe</li>
                <li>• 🔄 Sistema de notificaciones push</li>
                <li>• 🔄 Generación de QR y PDFs</li>
                <li>• 🔄 WebSockets para actualizaciones en tiempo real</li>
                <li>• 🔄 Sistema de analytics con métricas reales</li>
                <li>• 🔄 Tests automatizados y CI/CD</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};