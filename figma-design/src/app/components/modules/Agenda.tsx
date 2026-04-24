import React, { useState } from 'react';
import { useEvents, filterEvents, sortEvents } from '../../hooks/useData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Calendar, Clock, MapPin, Users, ShoppingCart, QrCode, Ticket, LogIn } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PaymentProcessor, usePaymentProcessor, PaymentResult } from '../PaymentProcessor';
import { LoginModal } from '../LoginModal';
import { HeroCarousel } from '../HeroCarousel';
import { TicketSelector } from '../TicketSelector';
import { toast } from 'sonner@2.0.3';
import { TicketType } from '../../data/mockData';

const statusLabels = {
  upcoming: 'Próximo',
  'sold-out': 'Agotado',
  cancelled: 'Cancelado',
  'in-progress': 'En curso',
  ended: 'Finalizado'
};

const statusColors = {
  upcoming: 'bg-blue-500',
  'sold-out': 'bg-red-500',
  cancelled: 'bg-gray-500',
  'in-progress': 'bg-green-500',
  ended: 'bg-gray-400'
};

export const Agenda: React.FC = () => {
  const { currentRole } = useApp();
  const { data: events, loading, error } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('date');
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'tickets' | 'checkout' | 'success'>('details');
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  
  const { 
    isOpen: isPaymentOpen, 
    paymentData, 
    processPayment, 
    closePayment, 
    onSuccessCallback, 
    onErrorCallback 
  } = usePaymentProcessor();

  // Apply filters and sorting
  const filteredEvents = filterEvents(events || [], { 
    category: filter === 'all' ? undefined : filter 
  });
  const sortedEvents = sortEvents(filteredEvents, sortBy);
  
  // Featured events for carousel
  const featuredEvents = events?.filter(event => event.featured) || [];
  
  // Ticket selection helpers
  const updateTicketQuantity = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };
  
  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };
  
  const getTotalPrice = () => {
    if (!selectedEvent) return 0;
    let total = 0;
    selectedEvent.ticketTypes.forEach((ticket: TicketType) => {
      const quantity = selectedTickets[ticket.id] || 0;
      total += quantity * ticket.price;
    });
    return total;
  };

  const handlePurchase = (event: any) => {
    setSelectedEvent(event);
    setSelectedTickets({});
    setPurchaseStep('tickets');
  };
  
  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
    setPurchaseStep('details');
  };

  const handlePayment = () => {
    if (!selectedEvent || getTotalTickets() === 0) return;
    
    const total = getTotalPrice() + 500; // Incluye fee de servicio
    
    processPayment(
      {
        amount: total,
        type: 'full',
        description: `Ticket para ${selectedEvent.title}`,
        metadata: {
          ticketId: `TICKET-${Date.now()}-${selectedEvent.id}`,
          orderId: Date.now().toString()
        }
      },
      (result: PaymentResult) => {
        // Success callback
        if (result.status === 'success' && result.transactionId && result.qrCode) {
          setTransactionId(result.transactionId);
          setGeneratedQR(result.qrCode);
          setPurchaseStep('success');
          
          // Store ticket in localStorage with QR code
          const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
          const newTicket = {
            id: Date.now().toString(),
            eventId: selectedEvent.id,
            eventTitle: selectedEvent.title,
            eventDate: selectedEvent.date,
            eventTime: selectedEvent.time,
            venue: selectedEvent.space,
            price: getTotalPrice(),
            purchaseDate: new Date().toISOString(),
            qrCode: result.qrCode,
            transactionId: result.transactionId,
            status: 'confirmed',
            paymentMethod: 'card',
            ticketTypes: selectedEvent.ticketTypes.filter((ticket: TicketType) => selectedTickets[ticket.id] > 0)
              .map((ticket: TicketType) => ({
                type: ticket.name,
                quantity: selectedTickets[ticket.id],
                price: ticket.price
              }))
          };
          tickets.push(newTicket);
          localStorage.setItem('userTickets', JSON.stringify(tickets));
        }
      },
      (error: string) => {
        // Error callback
        toast.error(`Error en el pago: ${error}`);
      }
    );
  };

  const canPurchase = ['visitante', 'cliente'].includes(currentRole);
  const isPublic = currentRole === 'publico';

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️ Error al cargar eventos</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Agenda de Eventos</h1>
          <p className="text-muted-foreground">Descubre los próximos eventos en El Castillo Barracas</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Música">Música</SelectItem>
              <SelectItem value="Arte">Arte</SelectItem>
              <SelectItem value="Taller">Talleres</SelectItem>
              <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="popularity">Popularidad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hero Carousel */}
      {featuredEvents.length > 0 && (
        <HeroCarousel 
          events={featuredEvents} 
          onEventSelect={handleEventSelect}
        />
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <ImageWithFallback
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <Badge 
                className={`absolute top-2 right-2 ${statusColors[event.status]} text-white`}
              >
                {statusLabels[event.status]}
              </Badge>
            </div>

            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                <Badge variant="outline">{event.category}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(event.date).toLocaleDateString('es-AR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{event.time}hs</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.space}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.ticketsSold}/{event.capacity} tickets</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">
                  Desde ${Math.min(...event.ticketTypes.map(t => t.price)).toLocaleString()}
                </span>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default"
                      onClick={() => {
                        setSelectedEvent(event);
                        setPurchaseStep('details');
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {purchaseStep === 'details' && (
                      <>
                        <DialogHeader>
                          <DialogTitle>{selectedEvent?.title}</DialogTitle>
                          <DialogDescription>
                            Ver detalles del evento y comprar tickets
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <ImageWithFallback
                            src={selectedEvent?.image || ''}
                            alt={selectedEvent?.title || ''}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          
                          <p>{selectedEvent?.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{selectedEvent && new Date(selectedEvent.date).toLocaleDateString('es-AR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{selectedEvent?.time}hs</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{selectedEvent?.space}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Capacidad: {selectedEvent?.capacity}</span>
                              </div>
                            </div>
                          </div>

                          {isPublic && selectedEvent?.status === 'upcoming' && (
                            <div className="space-y-3">
                              <Button 
                                className="w-full" 
                                size="lg"
                                onClick={() => setShowLoginModal(true)}
                              >
                                <LogIn className="h-4 w-4 mr-2" />
                                Inicia sesión para comprar - Desde ${Math.min(...selectedEvent.ticketTypes.map(t => t.price)).toLocaleString()}
                              </Button>
                              <p className="text-xs text-center text-muted-foreground">
                                Necesitas una cuenta para comprar tickets
                              </p>
                            </div>
                          )}

                          {canPurchase && selectedEvent?.status === 'upcoming' && (
                            <Button 
                              className="w-full" 
                              size="lg"
                              onClick={() => {
                                setSelectedTickets({});
                                setPurchaseStep('tickets');
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Comprar Tickets - Desde ${Math.min(...selectedEvent.ticketTypes.map(t => t.price)).toLocaleString()}
                            </Button>
                          )}

                          {selectedEvent?.status === 'sold-out' && (
                            <Button disabled className="w-full" size="lg">
                              Agotado
                            </Button>
                          )}
                        </div>
                      </>
                    )}

                    {purchaseStep === 'tickets' && selectedEvent && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            Seleccionar Tickets - {selectedEvent.title}
                          </DialogTitle>
                          <DialogDescription>
                            Elige el tipo y cantidad de tickets que deseas comprar
                          </DialogDescription>
                        </DialogHeader>
                        
                        <TicketSelector 
                          event={selectedEvent}
                          selectedTickets={selectedTickets}
                          onTicketChange={updateTicketQuantity}
                          onContinue={() => setPurchaseStep('checkout')}
                          onBack={() => setPurchaseStep('details')}
                        />
                      </>
                    )}

                    {purchaseStep === 'checkout' && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            Checkout - {selectedEvent?.title}
                          </DialogTitle>
                          <DialogDescription>
                            Completa tu compra de tickets con MercadoPago o Stripe
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* Order Summary */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Resumen de compra</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {selectedEvent?.ticketTypes.map((ticket: TicketType) => {
                                  const quantity = selectedTickets[ticket.id] || 0;
                                  if (quantity === 0) return null;
                                  return (
                                    <div key={ticket.id} className="flex justify-between">
                                      <span>{quantity}x {ticket.name}</span>
                                      <span>${(quantity * ticket.price).toLocaleString()}</span>
                                    </div>
                                  );
                                })}
                                <div className="flex justify-between text-sm text-muted-foreground">
                                  <span>Fee de servicio</span>
                                  <span>$500</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between font-medium text-lg">
                                  <span>Total</span>
                                  <span>${(getTotalPrice() + 500).toLocaleString()}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Event Details */}
                          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <QrCode className="h-5 w-5 text-blue-600" />
                                <h4 className="font-medium text-blue-800 dark:text-blue-200">
                                  Incluye Código QR
                                </h4>
                              </div>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                Recibirás un código QR único después del pago para acceder al evento
                              </p>
                            </CardContent>
                          </Card>

                          {/* Payment Action */}
                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setPurchaseStep('tickets')}
                              className="flex-1"
                            >
                              Volver
                            </Button>
                            <Button 
                              className="flex-1" 
                              size="lg"
                              onClick={handlePayment}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Proceder al Pago
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {purchaseStep === 'success' && (
                      <>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5 text-green-600" />
                            ¡Compra Exitosa!
                          </DialogTitle>
                          <DialogDescription>
                            Tu ticket ha sido procesado exitosamente
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          {/* QR Code Display */}
                          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                            <CardContent className="text-center py-6">
                              {generatedQR && (
                                <div className="space-y-4">
                                  <img 
                                    src={generatedQR} 
                                    alt="QR Code del Ticket" 
                                    className="w-48 h-48 mx-auto border rounded-lg bg-white p-2"
                                  />
                                  <div>
                                    <h3 className="font-medium text-green-700 dark:text-green-300 mb-1">
                                      Código QR Generado
                                    </h3>
                                    <p className="text-sm text-green-600 dark:text-green-400">
                                      Presenta este código en la entrada del evento
                                    </p>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>

                          {/* Transaction Details */}
                          <Card>
                            <CardHeader>
                              <CardTitle>Detalles de la Transacción</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">ID Transacción:</span>
                                  <div className="font-mono text-xs break-all">{transactionId}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Estado:</span>
                                  <div className="flex items-center gap-1">
                                    <Badge className="bg-green-500 text-white">Confirmado</Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="border-t pt-3">
                                <h4 className="font-medium mb-2">Detalles del Evento</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Evento:</span>
                                    <span>{selectedEvent?.title}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Fecha:</span>
                                    <span>{selectedEvent && new Date(selectedEvent.date).toLocaleDateString('es-AR')}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Hora:</span>
                                    <span>{selectedEvent?.time}hs</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Lugar:</span>
                                    <span>{selectedEvent?.space}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Total Pagado:</span>
                                    <span>${(selectedEvent?.price + 500).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Actions */}
                          <div className="space-y-3">
                            <Button 
                              className="w-full" 
                              onClick={() => {
                                setPurchaseStep('details');
                                setGeneratedQR('');
                                setTransactionId('');
                              }}
                            >
                              Cerrar
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              El ticket también ha sido añadido a tu perfil
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No hay eventos disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron eventos con los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Payment Processor */}
      {isPaymentOpen && paymentData && onSuccessCallback && onErrorCallback && (
        <PaymentProcessor
          isOpen={isPaymentOpen}
          onClose={closePayment}
          paymentData={paymentData}
          onSuccess={onSuccessCallback}
          onError={onErrorCallback}
        />
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};