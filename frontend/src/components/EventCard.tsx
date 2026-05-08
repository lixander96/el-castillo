import React, { FC, useState } from 'react'
import type { Event, TicketType } from '../data/mockData'
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, Clock, MapPin, Users, ShoppingCart, QrCode, Ticket, LogIn } from 'lucide-react';
import { TicketSelector } from './TicketSelector';
import { checkoutPro, createOrder } from './../lib/api';
import { Label } from './ui/label';
import { Input } from './ui/input';
import EventModal from './EventModal';

interface EventCardProps {
    event: Event,
    setShowLoginModal: (open: boolean) => any
}

const formatEventDate = (date: string) => {
  if (!date) return 'Sin fecha';
  try {
    const formatter = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formatter.format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
};

const statusLabels: Record<string, string> = {
    upcoming: 'Proximo',
    'sold-out': 'Agotado',
    cancelled: 'Cancelado',
    'in-progress': 'En curso',
    ended: 'Finalizado',
};
const statusColors: Record<string, string> = {
    upcoming: 'bg-blue-500',
    'sold-out': 'bg-red-500',
    cancelled: 'bg-gray-500',
    'in-progress': 'bg-green-500',
    ended: 'bg-gray-400',
};
const priceOf = (ticket: TicketType) => {
    const value = (ticket as any)?.price;
    if (typeof value === 'number') return value;
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
};

const EventCard: FC<EventCardProps> = ({ event, setShowLoginModal }) => {
    const [openDialog, setOpenDialog] = useState(false)

    const getMinTicketPrice = (ticketTypes: TicketType[] = []) => {
        const prices = ticketTypes
            .map((ticket) => priceOf(ticket))
            .filter((price) => Number.isFinite(price) && price > 0);
        return prices.length ? Math.min(...prices) : 0;
    };
    const minPrice = getMinTicketPrice(event.ticketTypes);
    return (
        <>
            <Card key={event.id} className="cursor-pointer overflow-hidden hover:shadow-lg transition-shadow relative" onClick={() => setOpenDialog(true)}>
                <div className="relative w-full h-full">
                    <ImageWithFallback src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    <Badge className={`absolute top-4 left-4 ${statusColors[event.status] || 'bg-gray-500'} text-white`}>
                        {statusLabels[event.status] || event.status}
                    </Badge>
                </div>
                <div className='absolute opacity-0 hover:opacity-100 w-full h-full overflow-auto bg-card'>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                            <Badge variant="outline">{event.category}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatEventDate(event.date)}</span>
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
                                <span>{(event.capacity - event.ticketsSold === 0) ? 'Agotado' : (event.capacity - (event.ticketsSold / event.capacity) > 0.1) ? "Entradas disponibles" : 'Quedan pocas'}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xl font-bold">
                                {minPrice > 0 ? `Desde $${minPrice.toLocaleString()}` : 'Tickets no disponibles'}
                            </span>
                        </div>
                    </CardContent>
                </div>
            </Card>
            <EventModal event={event} setShowLoginModal={setShowLoginModal} open={openDialog} onOpenChange={setOpenDialog} />
        </>
    )
}

export default EventCard