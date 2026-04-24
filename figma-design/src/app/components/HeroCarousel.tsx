import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Calendar, Clock, MapPin, Star, ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Event } from '../data/mockData';

interface HeroCarouselProps {
  events: Event[];
  onEventSelect: (event: Event) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ events, onEventSelect }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (events.length === 0) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div className="relative rounded-xl overflow-hidden mb-8">
      <div className="relative h-[400px] md:h-[500px]">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ImageWithFallback
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
              <div className="max-w-4xl">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <Badge className="bg-primary text-primary-foreground">
                    Evento Destacado
                  </Badge>
                  <Badge variant="outline" className="border-white/30 text-white">
                    {event.category}
                  </Badge>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {event.title}
                </h2>
                
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl leading-relaxed">
                  {event.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{new Date(event.date).toLocaleDateString('es-AR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{event.time}hs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.space}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    Desde ${Math.min(...event.ticketTypes.map(t => t.price)).toLocaleString()}
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6"
                    onClick={() => onEventSelect(event)}
                  >
                    <Ticket className="h-5 w-5 mr-2" />
                    Ver Detalles y Comprar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Controls */}
      {events.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};