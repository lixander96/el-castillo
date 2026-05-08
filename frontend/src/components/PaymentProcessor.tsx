import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Shield,
  Lock,
  QrCode,
  Receipt,
  Clock,
  Percent
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export type PaymentMethod = 'mercadopago' | 'stripe';
export type PaymentType = 'full' | 'deposit' | 'commission';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'error' | 'cancelled' | 'retry';

interface PaymentData {
  amount: number;
  type: PaymentType;
  description: string;
  metadata?: {
    orderId?: string;
    ticketId?: string;
    reservationId?: string;
    productId?: string;
    commission?: number;
    depositPercentage?: number;
  };
}

interface PaymentResult {
  status: PaymentStatus;
  transactionId?: string;
  qrCode?: string;
  receipt?: any;
  error?: string;
}

interface PaymentProcessorProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentData;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onError
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [transactionId, setTransactionId] = useState<string>('');

  // Form data
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '',
    document: ''
  });

  const [installments, setInstallments] = useState('1');

  useEffect(() => {
    if (paymentStatus === 'processing') {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.random() * 20;
        setProgress(Math.min(currentProgress, 90));
        
        if (currentProgress >= 90) {
          clearInterval(interval);
          simulatePaymentResult();
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [paymentStatus]);

  const simulatePaymentResult = () => {
    // Simulate different outcomes based on retry count
    const random = Math.random();
    const shouldSucceed = retryCount >= 2 || random > 0.3; // Higher success rate after retries
    
    setTimeout(() => {
      if (shouldSucceed) {
        const transactionId = `${paymentMethod.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setTransactionId(transactionId);
        setPaymentStatus('success');
        setProgress(100);
        
        const result: PaymentResult = {
          status: 'success',
          transactionId,
          qrCode: paymentData.type === 'full' ? generateQRCode(transactionId) : undefined,
          receipt: {
            transactionId,
            amount: paymentData.amount,
            method: paymentMethod,
            timestamp: new Date(),
            description: paymentData.description
          }
        };
        
        onSuccess(result);
        toast.success('¡Pago procesado exitosamente!');
      } else {
        const errors = [
          'Tarjeta rechazada por el banco',
          'Fondos insuficientes',
          'Error de conexión con el procesador',
          'Datos de tarjeta inválidos',
          'Límite de transacción excedido'
        ];
        const error = errors[Math.floor(Math.random() * errors.length)];
        setPaymentStatus('error');
        setProgress(0);
        onError(error);
        toast.error(`Error en el pago: ${error}`);
      }
    }, 1000);
  };

  const generateQRCode = (transactionId: string): string => {
    // Simulate QR code generation
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="30" y="30" width="140" height="140" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-family="monospace" font-size="8" fill="black">
          ${transactionId}
        </text>
      </svg>
    `)}`;
  };

  const handlePayment = () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setPaymentStatus('processing');
    setProgress(0);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPaymentStatus('processing');
    setProgress(0);
    toast.info('Reintentando pago...');
  };

  const handleCancel = () => {
    setPaymentStatus('cancelled');
    onClose();
    toast.info('Pago cancelado');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getPaymentTypeLabel = () => {
    switch (paymentData.type) {
      case 'full':
        return 'Pago Completo';
      case 'deposit':
        return `Seña (${paymentData.metadata?.depositPercentage || 30}%)`;
      case 'commission':
        return `Comisión (${paymentData.metadata?.commission || 10}%)`;
      default:
        return 'Pago';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Procesamiento de Pago
          </DialogTitle>
          <DialogDescription>
            {paymentStatus === 'pending' && 'Selecciona tu método de pago e ingresa los detalles'}
            {paymentStatus === 'processing' && 'Procesando tu pago de forma segura'}
            {paymentStatus === 'success' && 'Tu pago se ha procesado exitosamente'}
            {paymentStatus === 'error' && 'Ha ocurrido un error al procesar el pago'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Resumen del Pago</span>
                <Badge variant="outline">{getPaymentTypeLabel()}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Concepto:</span>
                  <span>{paymentData.description}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total a pagar:</span>
                  <span>{formatAmount(paymentData.amount)}</span>
                </div>
                {paymentData.metadata?.commission && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Comisión de plataforma:</span>
                    <span>{paymentData.metadata.commission}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus !== 'pending' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {paymentStatus === 'processing' && (
                    <>
                      <div className="flex justify-center">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">Procesando Pago...</h3>
                        <p className="text-sm text-muted-foreground">
                          Conectando con {paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Stripe'}
                        </p>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </>
                  )}

                  {paymentStatus === 'success' && (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <h3 className="font-medium text-green-700">¡Pago Exitoso!</h3>
                        <p className="text-sm text-muted-foreground">
                          Transacción ID: {transactionId}
                        </p>
                      </div>
                      {paymentData.type === 'full' && (
                        <div className="space-y-2">
                          <QrCode className="h-8 w-8 mx-auto text-gray-600" />
                          <p className="text-sm">QR Code generado para tu ticket</p>
                        </div>
                      )}
                    </>
                  )}

                  {paymentStatus === 'error' && (
                    <>
                      <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                      <div>
                        <h3 className="font-medium text-red-700">Error en el Pago</h3>
                        <p className="text-sm text-muted-foreground">
                          El pago no pudo ser procesado
                        </p>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleRetry} variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reintentar {retryCount > 0 && `(${retryCount})`}
                        </Button>
                        <Button onClick={handleCancel} variant="outline">
                          Cancelar
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Form */}
          {paymentStatus === 'pending' && (
            <>
              {/* Payment Method Selection */}
              <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mercadopago" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    MercadoPago
                  </TabsTrigger>
                  <TabsTrigger value="stripe" className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded"></div>
                    Stripe
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mercadopago" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-500 rounded"></div>
                        Pago con MercadoPago
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mp-card-number">Número de tarjeta</Label>
                          <Input
                            id="mp-card-number"
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mp-cardholder">Nombre del titular</Label>
                          <Input
                            id="mp-cardholder"
                            placeholder="Nombre Apellido"
                            value={cardData.name}
                            onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mp-expiry">Vencimiento</Label>
                          <Input
                            id="mp-expiry"
                            placeholder="MM/AA"
                            value={cardData.expiry}
                            onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mp-cvv">CVV</Label>
                          <Input
                            id="mp-cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mp-installments">Cuotas</Label>
                          <Select value={installments} onValueChange={setInstallments}>
                            <SelectTrigger id="mp-installments">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 cuota sin interés</SelectItem>
                              <SelectItem value="3">3 cuotas sin interés</SelectItem>
                              <SelectItem value="6">6 cuotas (CFT 12%)</SelectItem>
                              <SelectItem value="12">12 cuotas (CFT 24%)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mp-email">Email</Label>
                          <Input
                            id="mp-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={cardData.email}
                            onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mp-document">DNI</Label>
                          <Input
                            id="mp-document"
                            placeholder="12345678"
                            value={cardData.document}
                            onChange={(e) => setCardData(prev => ({ ...prev, document: e.target.value }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stripe" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-500 rounded"></div>
                        Pago con Stripe
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe-card-number">Número de tarjeta</Label>
                        <Input
                          id="stripe-card-number"
                          placeholder="4242 4242 4242 4242"
                          value={cardData.number}
                          onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stripe-expiry">MM / AA</Label>
                          <Input
                            id="stripe-expiry"
                            placeholder="12 / 24"
                            value={cardData.expiry}
                            onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stripe-cvv">CVC</Label>
                          <Input
                            id="stripe-cvv"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stripe-name">Nombre del titular</Label>
                        <Input
                          id="stripe-name"
                          placeholder="Nombre Apellido"
                          value={cardData.name}
                          onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stripe-email">Email</Label>
                        <Input
                          id="stripe-email"
                          type="email"
                          placeholder="tu@email.com"
                          value={cardData.email}
                          onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Security Info */}
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Pago Seguro</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Tus datos están protegidos con encriptación SSL de 256 bits
                  </p>
                </CardContent>
              </Card>

              {/* Payment Actions */}
              <div className="flex gap-3">
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handlePayment} className="flex-1">
                  <Lock className="h-4 w-4 mr-2" />
                  Pagar {formatAmount(paymentData.amount)}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for using payment processor
export const usePaymentProcessor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<((result: PaymentResult) => void) | null>(null);
  const [onErrorCallback, setOnErrorCallback] = useState<((error: string) => void) | null>(null);

  const processPayment = (
    data: PaymentData,
    onSuccess: (result: PaymentResult) => void,
    onError: (error: string) => void
  ) => {
    setPaymentData(data);
    setOnSuccessCallback(() => onSuccess);
    setOnErrorCallback(() => onError);
    setIsOpen(true);
  };

  const closePayment = () => {
    setIsOpen(false);
    setPaymentData(null);
    setOnSuccessCallback(null);
    setOnErrorCallback(null);
  };

  return {
    isOpen,
    paymentData,
    processPayment,
    closePayment,
    onSuccessCallback,
    onErrorCallback
  };
};