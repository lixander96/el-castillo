import React, { useState } from 'react';
import { mockBids } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Gavel, TrendingUp, Clock, CheckCircle, XCircle, MessageSquare, DollarSign } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const Pujas: React.FC = () => {
  const { currentRole } = useApp();
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);

  const isAuthorized = ['cliente', 'operaciones', 'admin'].includes(currentRole);

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Acceso restringido</h3>
          <p className="text-muted-foreground">
            Solo los clientes y el equipo de operaciones pueden acceder a las pujas.
          </p>
        </div>
      </div>
    );
  }

  const handleBidAction = (bidId: string, action: 'accept' | 'reject' | 'counter', details?: any) => {
    const actionText = action === 'accept' ? 'aceptada' : action === 'reject' ? 'rechazada' : 'contraoferta enviada';
    
    // Simulate API call with loading
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(`Puja ${actionText} exitosamente`);
        }, 1500);
      }),
      {
        loading: `Procesando ${actionText}...`,
        success: (data: any) => data,
        error: 'Error al procesar la acción'
      }
    );

    // Reset form
    setCounterOfferAmount('');
    setActionReason('');
    setShowCounterOfferDialog(false);
  };

  const handleCounterOffer = () => {
    if (!counterOfferAmount || !selectedBid) {
      toast.error('Ingresa un monto para la contraoferta');
      return;
    }

    const amount = parseFloat(counterOfferAmount);
    if (amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    handleBidAction(selectedBid.id, 'counter', {
      amount,
      reason: actionReason
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1>Sistema de Pujas</h1>
        <p className="text-muted-foreground">
          {currentRole === 'cliente' ? 'Gestiona tus ofertas de reserva' : 'Administra las pujas recibidas'}
        </p>
      </div>

      {currentRole === 'cliente' && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Pujas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Concierto privado - Sala Principal</h3>
                    <p className="text-sm text-muted-foreground">Propuesta: $50,000</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendiente
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Enviada hace 2 días
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {['operaciones', 'admin'].includes(currentRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Pujas Recibidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockBids.map(bid => (
                <div key={bid.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium">Reserva #{bid.reservationId}</h3>
                      <p className="text-sm text-muted-foreground">
                        Monto propuesto: ${bid.proposedAmount.toLocaleString()}
                      </p>
                      <Badge variant="outline">
                        {bid.status === 'pending' ? 'Pendiente' : bid.status}
                      </Badge>
                    </div>
                    
                    {bid.status === 'pending' && (
                      <div className="flex gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aceptar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Aceptación</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres aceptar esta puja por ${bid.proposedAmount.toLocaleString()}?
                                Esta acción generará un contrato automático.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleBidAction(bid.id, 'accept')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar Aceptación
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <Dialog open={showCounterOfferDialog} onOpenChange={setShowCounterOfferDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedBid(bid);
                                setShowCounterOfferDialog(true);
                              }}
                            >
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Contraoferta
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enviar Contraoferta</DialogTitle>
                              <DialogDescription>
                                Propón un monto diferente para la reserva #{selectedBid?.reservationId}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm">
                                  <strong>Oferta original:</strong> ${selectedBid?.proposedAmount.toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="counterAmount">Monto de contraoferta ($)</Label>
                                <Input
                                  id="counterAmount"
                                  type="number"
                                  value={counterOfferAmount}
                                  onChange={(e) => setCounterOfferAmount(e.target.value)}
                                  placeholder="Ingresa tu contraoferta"
                                  min="0"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="reason">Justificación (opcional)</Label>
                                <Textarea
                                  id="reason"
                                  value={actionReason}
                                  onChange={(e) => setActionReason(e.target.value)}
                                  placeholder="Explica el motivo de tu contraoferta..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => setShowCounterOfferDialog(false)}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={handleCounterOffer}
                                  className="flex-1"
                                >
                                  Enviar Contraoferta
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rechazar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Rechazo</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que quieres rechazar esta puja? 
                                Se enviará una notificación automática al cliente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleBidAction(bid.id, 'reject')}
                                variant="destructive"
                              >
                                Confirmar Rechazo
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};