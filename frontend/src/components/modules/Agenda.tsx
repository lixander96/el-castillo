import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEvents, filterEvents, sortEvents } from '../../hooks/useData';
import { useApp } from '../../contexts/AppContext';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from 'lucide-react';
import { LoginModal } from '../LoginModal';
import { HeroCarousel } from '../HeroCarousel';
import { toast } from 'sonner@2.0.3';
import EventCard from '../EventCard';
import useWindowSize from '../../hooks/useWindowSize';


export const Agenda: React.FC = () => {
  const location = useLocation();
  const size = useWindowSize();
  const { data: events, loading, error } = useEvents();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('date');
  const [showLoginModal, setShowLoginModal] = useState(false);
  console.log(events)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const orderId = params.get('orderId');
    if (status) {
      if (status === 'success') {
        toast.success('Pago aprobado. Gracias por tu compra!');
      } else if (status === 'pending') {
        toast.info('Tu pago esta en revision. Te avisaremos cuando se acredite.');
      } else {
        toast.error('El pago fue rechazado o cancelado. Intentalo nuevamente.');
      }
      if (orderId) {
        toast.info(`Referencia de orden: ${orderId}`);
      }
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.pathname, location.search]);
  const filteredEvents = useMemo(() => {
    return filterEvents(events || [], {
      category: filter === 'all' ? undefined : filter,
    });
  }, [events, filter]);
  const sortedEvents = useMemo(() => sortEvents(filteredEvents, sortBy), [filteredEvents, sortBy]);
  const featuredEvents = useMemo(() => (events || []).filter((event) => event.featured), [events]);
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
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
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Error al cargar eventos</div>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Agenda de Eventos</h1>
          <p className="text-muted-foreground">Descubre los proximos eventos en El Castillo Barracas.</p>
        </div>
        {/* Filtro */}
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Musica">Musica</SelectItem>
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
              <SelectItem value="price">Precio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Hero */}
      {featuredEvents.length > 0 && size.width > 1024 && (
        <HeroCarousel events={featuredEvents} setShowLoginModal={setShowLoginModal} />
      )}
      {/* Lista de eventos filtrada */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedEvents.map((event) =>
          <EventCard key={event.id} event={event} setShowLoginModal={setShowLoginModal} />
        )}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">No hay eventos disponibles</h3>
          <p className="text-muted-foreground">No se encontraron eventos con los filtros seleccionados.</p>
        </div>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Agenda;



