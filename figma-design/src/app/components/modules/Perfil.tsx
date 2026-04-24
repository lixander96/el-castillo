import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useEvents } from '../../hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { QrCode, Calendar, Download, User, Settings, Ticket, Clock, MapPin, Users, DollarSign, Edit2, BarChart3, Plus, Minus, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { TicketType, Event } from '../../data/mockData';

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  price: number;
  purchaseDate: string;
  qrCode: string;
  status: 'confirmed' | 'used' | 'cancelled';
}

export const Perfil: React.FC = () => {
  const { currentRole } = useApp();
  const { data: events } = useEvents();
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [editingTickets, setEditingTickets] = useState<{[eventId: string]: {[ticketId: string]: number}}>({});
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const isAuthorized = ['visitante', 'artista', 'cliente'].includes(currentRole);
  const isEventOrganizer = currentRole === 'cliente';
  
  // Mock user ID - en una app real vendría del contexto de auth
  const currentUserId = '3'; // Carlos Cliente
  
  // Eventos organizados por el usuario actual
  const organizedEvents = events?.filter(event => event.organizerId === currentUserId) || [];

  useEffect(() => {
    // Load user tickets from localStorage
    const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
    setUserTickets(tickets);
  }, []);

  const handleDownloadTicket = (ticket: UserTicket) => {
    toast.success(`Ticket descargado: ${ticket.eventTitle}`);
  };

  const handleUpdateTicketAvailability = (eventId: string, ticketId: string, newAvailable: number) => {
    setEditingTickets(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [ticketId]: Math.max(0, newAvailable)
      }
    }));
  };

  const saveTicketChanges = (event: Event) => {
    const eventChanges = editingTickets[event.id];
    if (!eventChanges) return;

    // Aquí en una app real se haría la llamada a la API
    toast.success(`Cambios guardados para ${event.title}`);
    
    // Limpiar los cambios temporales
    setEditingTickets(prev => {
      const newState = { ...prev };
      delete newState[event.id];
      return newState;
    });
  };

  const cancelTicketChanges = (eventId: string) => {
    setEditingTickets(prev => {
      const newState = { ...prev };
      delete newState[eventId];
      return newState;
    });
  };

  const getEventStats = (event: Event) => {
    const totalTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.total, 0);
    const soldTickets = event.ticketTypes.reduce((sum, ticket) => sum + ticket.sold, 0);
    const revenue = event.ticketTypes.reduce((sum, ticket) => sum + (ticket.sold * ticket.price), 0);
    const occupancyRate = totalTickets > 0 ? (soldTickets / totalTickets) * 100 : 0;
    
    return {
      totalTickets,
      soldTickets,
      revenue,
      occupancyRate: Math.round(occupancyRate)
    };
  };

  const generateQRCode = (qrCode: string) => {
    // In a real app, this would generate an actual QR code image
    // For demo purposes, we'll show a placeholder
    return (
      <div className="w-32 h-32 bg-muted border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
          <div className="text-xs font-mono break-all px-2">
            {qrCode.slice(-8)}
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Perfil no disponible</h3>
          <p className="text-muted-foreground">
            Esta funcionalidad está disponible para visitantes, artistas y clientes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <h1>Mi Perfil</h1>
          <p className="text-muted-foreground">
            {currentRole === 'visitante' && 'Gestiona tu cuenta y tickets'}
            {currentRole === 'artista' && 'Perfil de artista - Gestiona tu portafolio'}
            {currentRole === 'cliente' && 'Organizador de eventos - Gestiona tus eventos y ventas'}
          </p>
        </div>
      </div>

      <Tabs defaultValue={isEventOrganizer ? "events" : "tickets"}>
        <TabsList>
          <TabsTrigger value="tickets">Mis Tickets</TabsTrigger>
          {isEventOrganizer && <TabsTrigger value="events">Mis Eventos</TabsTrigger>}
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Mis Tickets ({userTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No tienes tickets</h3>
                  <p className="text-muted-foreground">
                    Los tickets que compres aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <h3 className="font-medium">{ticket.eventTitle}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(ticket.eventDate).toLocaleDateString('es-AR')} - {ticket.eventTime}hs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{ticket.venue}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Comprado el {new Date(ticket.purchaseDate).toLocaleDateString('es-AR')}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Badge 
                            variant={ticket.status === 'confirmed' ? 'default' : ticket.status === 'used' ? 'secondary' : 'destructive'}
                          >
                            {ticket.status === 'confirmed' ? 'Confirmado' : ticket.status === 'used' ? 'Usado' : 'Cancelado'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">${ticket.price.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Ticket ID: {ticket.qrCode.slice(-6)}</div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <QrCode className="h-4 w-4 mr-2" />
                              Ver QR
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Ticket QR Code</DialogTitle>
                              <DialogDescription>
                                Presenta este código QR en el evento para acceder
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 text-center">
                              <div className="p-6 bg-white dark:bg-muted rounded-lg">
                                {generateQRCode(selectedTicket?.qrCode || '')}
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="font-medium">{selectedTicket?.eventTitle}</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center justify-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{selectedTicket && new Date(selectedTicket.eventDate).toLocaleDateString('es-AR')} - {selectedTicket?.eventTime}hs</span>
                                  </div>
                                  <div className="flex items-center justify-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{selectedTicket?.venue}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  Presenta este QR en la entrada del evento
                                </p>
                              </div>
                              
                              <Button 
                                onClick={() => selectedTicket && handleDownloadTicket(selectedTicket)}
                                className="w-full"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar Ticket
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isEventOrganizer && (
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Mis Eventos Organizados ({organizedEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organizedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">No tienes eventos organizados</h3>
                    <p className="text-muted-foreground">
                      Los eventos que organices aparecerán aquí para que puedas gestionarlos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {organizedEvents.map(event => {
                      const stats = getEventStats(event);
                      const hasChanges = editingTickets[event.id];
                      
                      return (
                        <Card key={event.id} className="border">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{event.title}</CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(event.date).toLocaleDateString('es-AR')}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{event.time}hs</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.space}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge 
                                className={`${event.status === 'upcoming' ? 'bg-blue-500' : 
                                  event.status === 'sold-out' ? 'bg-red-500' : 'bg-gray-500'} text-white`}
                              >
                                {event.status === 'upcoming' ? 'Próximo' : 
                                 event.status === 'sold-out' ? 'Agotado' : 'Finalizado'}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-6">
                            {/* Estadísticas del evento */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-primary">{stats.soldTickets}</div>
                                <div className="text-sm text-muted-foreground">Vendidos</div>
                              </div>
                              <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{stats.totalTickets}</div>
                                <div className="text-sm text-muted-foreground">Total</div>
                              </div>
                              <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Ingresos</div>
                              </div>
                              <div className="text-center p-3 bg-muted rounded-lg">
                                <div className="text-2xl font-bold text-amber-600">{stats.occupancyRate}%</div>
                                <div className="text-sm text-muted-foreground">Ocupación</div>
                              </div>
                            </div>

                            {/* Gestión de tipos de tickets */}
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">Gestión de Tickets</h4>
                                {hasChanges && (
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => cancelTicketChanges(event.id)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      size="sm"
                                      onClick={() => saveTicketChanges(event)}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      Guardar
                                    </Button>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-3">
                                {event.ticketTypes.map(ticket => {
                                  const currentAvailable = editingTickets[event.id]?.[ticket.id] ?? ticket.available;
                                  const soldPercentage = ticket.total > 0 ? (ticket.sold / ticket.total) * 100 : 0;
                                  
                                  return (
                                    <div key={ticket.id} className="border rounded-lg p-4">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                          <div className="font-medium">{ticket.name}</div>
                                          <div className="text-sm text-muted-foreground">{ticket.description}</div>
                                          <div className="text-lg font-bold text-primary mt-1">
                                            ${ticket.price.toLocaleString()}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm text-muted-foreground">Vendidos/Total</div>
                                          <div className="font-medium">
                                            {ticket.sold}/{ticket.total}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Progress bar */}
                                      <div className="w-full bg-muted rounded-full h-2 mb-3">
                                        <div 
                                          className="bg-primary h-2 rounded-full transition-all" 
                                          style={{ width: `${soldPercentage}%` }}
                                        />
                                      </div>
                                      
                                      {/* Editar disponibilidad */}
                                      <div className="flex items-center gap-3">
                                        <Label className="text-sm font-medium">Disponibles:</Label>
                                        <div className="flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleUpdateTicketAvailability(
                                              event.id, 
                                              ticket.id, 
                                              currentAvailable - 1
                                            )}
                                            disabled={currentAvailable <= 0}
                                          >
                                            <Minus className="h-4 w-4" />
                                          </Button>
                                          
                                          <Input
                                            type="number"
                                            value={currentAvailable}
                                            onChange={(e) => handleUpdateTicketAvailability(
                                              event.id,
                                              ticket.id,
                                              parseInt(e.target.value) || 0
                                            )}
                                            className="w-20 text-center"
                                            min="0"
                                          />
                                          
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleUpdateTicketAvailability(
                                              event.id,
                                              ticket.id,
                                              currentAvailable + 1
                                            )}
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        
                                        {currentAvailable !== ticket.available && (
                                          <Badge variant="secondary" className="text-xs">
                                            {currentAvailable > ticket.available ? '+' : ''}{currentAvailable - ticket.available}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos Asistidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Taller de Cerámica</h3>
                    <p className="text-sm text-muted-foreground">Asistido el 10 Ene 2024</p>
                  </div>
                  <Badge variant="secondary">Completado</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recomendado para ti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Exposición de Arte Digital</h3>
                  <p className="text-sm text-muted-foreground">
                    Basado en tu asistencia a eventos de arte
                  </p>
                  <Button size="sm" className="mt-2">Ver Detalles</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Notificaciones</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Eventos recomendados</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Recordatorios de eventos</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};