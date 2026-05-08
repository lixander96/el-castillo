import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Minus, Plus, Check, AlertCircle } from 'lucide-react';
import { TicketType, Event } from '../data/mockData';

interface TicketSelectorProps {
  event: Event;
  selectedTickets: {[key: string]: number};
  onTicketChange: (ticketId: string, quantity: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  event,
  selectedTickets,
  onTicketChange,
  onContinue,
  onBack
}) => {
  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    let total = 0;
    event.ticketTypes.forEach((ticket: TicketType) => {
      const quantity = selectedTickets[ticket.id] || 0;
      total += quantity * ticket.price;
    });
    return total;
  };

  const hasSelectedTickets = getTotalTickets() > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Selecciona tus tickets</h3>
        <p className="text-muted-foreground">
          Elige el tipo y cantidad de tickets que deseas comprar
        </p>
      </div>

      <div className="space-y-4">
        {event.ticketTypes.map((ticket) => {
          const quantity = selectedTickets[ticket.id] || 0;
          const isAvailable = ticket.available > 0;
          const isSoldOut = ticket.available === 0;

          return (
            <Card 
              key={ticket.id} 
              className={`${isSoldOut ? 'opacity-60' : ''} ${quantity > 0 ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {ticket.name}
                      {quantity > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {quantity} seleccionado{quantity > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      ${ticket.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isAvailable ? (
                        <span className="text-green-600">
                          {(ticket.available > 100) ? "Disponible" : 'Quedan pocas'}
                        </span>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Agotado
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Perks */}
                {ticket.perks && ticket.perks.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Incluye:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm text-muted-foreground">
                      {ticket.perks.map((perk, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onTicketChange(ticket.id, Math.max(0, quantity - 1))}
                      disabled={quantity === 0 || isSoldOut}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="font-medium w-8 text-center">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onTicketChange(ticket.id, quantity + 1)}
                      disabled={quantity >= ticket.available || isSoldOut}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {quantity > 0 && (
                    <div className="text-sm font-medium">
                      Subtotal: ${(quantity * ticket.price).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Availability Warning */}
                {isAvailable && ticket.available <= 5 && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>¡Quedan solo {ticket.available} tickets!</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {hasSelectedTickets && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {getTotalTickets()} ticket{getTotalTickets() > 1 ? 's' : ''} seleccionado{getTotalTickets() > 1 ? 's' : ''}
                </div>
                <div className="text-sm text-muted-foreground">
                  Para {event.title}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${getTotalPrice().toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  + fee de servicio
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Volver
        </Button>
        <Button 
          onClick={onContinue} 
          className="flex-1"
          disabled={!hasSelectedTickets}
        >
          Continuar al Checkout
        </Button>
      </div>
    </div>
  );
};