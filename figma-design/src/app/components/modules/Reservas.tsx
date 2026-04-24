import React, { useState } from 'react';
import { mockSpaces, mockReservations, Space, Reservation } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  ChefHat,
  Utensils,
  CreditCard,
  Receipt,
  DollarSign
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PaymentProcessor, usePaymentProcessor, PaymentResult } from '../PaymentProcessor';
import { toast } from 'sonner@2.0.3';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CateringDetails {
  serviceType: string;
  numberOfPeople: number;
  dietaryRestrictions: string[];
  serviceStartTime: string;
  serviceEndTime: string;
  menuType: string;
  specialRequests: string;
  budgetRange: string;
}

interface ReservationForm {
  spaceId: string;
  eventType: string;
  date: Date | undefined;
  startTime: string;
  duration: number;
  attendees: number;
  equipment: string[];
  catering: boolean;
  cateringDetails: CateringDetails;
  description: string;
  budget: number;
  attachments: string[];
}

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  rejected: 'Rechazada'
};

const statusColors = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  rejected: 'bg-red-500'
};

const statusIcons = {
  pending: AlertCircle,
  confirmed: CheckCircle,
  rejected: XCircle
};

export const Reservas: React.FC = () => {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState(currentRole === 'cliente' ? 'create' : 'manage');
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [requiresDeposit, setRequiresDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [formData, setFormData] = useState<ReservationForm>({
    spaceId: '',
    eventType: '',
    date: undefined,
    startTime: '',
    duration: 1,
    attendees: 1,
    equipment: [],
    catering: false,
    cateringDetails: {
      serviceType: '',
      numberOfPeople: 0,
      dietaryRestrictions: [],
      serviceStartTime: '',
      serviceEndTime: '',
      menuType: '',
      specialRequests: '',
      budgetRange: ''
    },
    description: '',
    budget: 0,
    attachments: []
  });

  const { 
    isOpen: isPaymentOpen, 
    paymentData, 
    processPayment, 
    closePayment, 
    onSuccessCallback, 
    onErrorCallback 
  } = usePaymentProcessor();

  const isClient = currentRole === 'cliente';
  const isOperations = ['operaciones', 'admin'].includes(currentRole);

  const calculateDeposit = () => {
    const baseAmount = formData.budget;
    const depositPercentage = 30; // 30% de seña
    return Math.ceil(baseAmount * (depositPercentage / 100));
  };

  const handleFormSubmit = () => {
    // Validate minimum 48 hours
    if (formData.date) {
      const now = new Date();
      const eventDate = new Date(formData.date);
      const hoursDiff = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 48) {
        toast.error('La reserva debe realizarse con mínimo 48 horas de anticipación');
        return;
      }
    }

    // Check if deposit is required (for budgets over $10,000)
    if (formData.budget > 10000) {
      setRequiresDeposit(true);
      setDepositAmount(calculateDeposit());
      setFormStep(4); // Go to payment step
    } else {
      // Submit directly without payment
      submitReservation();
    }
  };

  const handleDepositPayment = () => {
    const deposit = calculateDeposit();
    
    processPayment(
      {
        amount: deposit,
        type: 'deposit',
        description: `Seña para reserva: ${formData.eventType}`,
        metadata: {
          reservationId: `RES-${Date.now()}`,
          depositPercentage: 30,
          totalAmount: formData.budget
        }
      },
      (result: PaymentResult) => {
        // Success callback
        if (result.status === 'success') {
          toast.success('Seña procesada exitosamente');
          submitReservation(result.transactionId);
        }
      },
      (error: string) => {
        // Error callback
        toast.error(`Error en el pago de seña: ${error}`);
      }
    );
  };

  const submitReservation = (transactionId?: string) => {
    // Store reservation data
    const reservations = JSON.parse(localStorage.getItem('userReservations') || '[]');
    const newReservation = {
      id: Date.now().toString(),
      ...formData,
      status: requiresDeposit ? 'pending_payment' : 'pending',
      depositPaid: requiresDeposit,
      depositAmount: requiresDeposit ? depositAmount : 0,
      transactionId: transactionId || null,
      submittedAt: new Date().toISOString()
    };
    reservations.push(newReservation);
    localStorage.setItem('userReservations', JSON.stringify(reservations));

    toast.success('Solicitud de reserva enviada correctamente');
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setFormStep(1);
    setRequiresDeposit(false);
    setDepositAmount(0);
    setFormData({
      spaceId: '',
      eventType: '',
      date: undefined,
      startTime: '',
      duration: 1,
      attendees: 1,
      equipment: [],
      catering: false,
      cateringDetails: {
        serviceType: '',
        numberOfPeople: 0,
        dietaryRestrictions: [],
        serviceStartTime: '',
        serviceEndTime: '',
        menuType: '',
        specialRequests: '',
        budgetRange: ''
      },
      description: '',
      budget: 0,
      attachments: []
    });
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      cateringDetails: {
        ...prev.cateringDetails,
        dietaryRestrictions: checked 
          ? [...prev.cateringDetails.dietaryRestrictions, restriction]
          : prev.cateringDetails.dietaryRestrictions.filter(r => r !== restriction)
      }
    }));
  };

  const updateCateringDetail = (field: keyof CateringDetails, value: any) => {
    setFormData(prev => ({
      ...prev,
      cateringDetails: {
        ...prev.cateringDetails,
        [field]: value
      }
    }));
  };

  const handleReservationAction = (reservationId: string, action: 'accept' | 'reject' | 'counter') => {
    toast.success(`Reserva ${action === 'accept' ? 'aceptada' : action === 'reject' ? 'rechazada' : 'contraoferta enviada'}`);
  };

  const canCreateReservation = isClient;
  const canManageReservations = isOperations;

  if (!canCreateReservation && !canManageReservations) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Acceso restringido</h3>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Reservas de Espacios</h1>
          <p className="text-muted-foreground">
            {isClient ? 'Solicita espacios para tus eventos' : 'Gestiona las solicitudes de reserva'}
          </p>
        </div>
        
        {isClient && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Reserva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Reserva - Paso {formStep} de {requiresDeposit ? 4 : 3}</DialogTitle>
                <DialogDescription>
                  {formStep === 4 ? 'Pago de seña requerido' : 'Completa los datos para solicitar una reserva de espacio'}
                </DialogDescription>
              </DialogHeader>

              {formStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Datos del Evento</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventType">Tipo de evento</Label>
                      <Input
                        id="eventType"
                        value={formData.eventType}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value }))}
                        placeholder="Ej: Concierto, Exposición, Taller"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="space">Espacio</Label>
                      <Select value={formData.spaceId} onValueChange={(value) => setFormData(prev => ({ ...prev, spaceId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar espacio" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockSpaces.map(space => (
                            <SelectItem key={space.id} value={space.id}>
                              {space.name} (Cap: {space.capacity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                            disabled={(date) => {
                              const now = new Date();
                              const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
                              return date < minDate;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startTime">Hora inicio</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración (horas)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees">Número de asistentes</Label>
                    <Input
                      id="attendees"
                      type="number"
                      min="1"
                      value={formData.attendees}
                      onChange={(e) => setFormData(prev => ({ ...prev, attendees: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Nota:</strong> Las reservas deben realizarse con mínimo 48 horas de anticipación.
                    </p>
                  </div>

                  <Button onClick={() => setFormStep(2)} className="w-full">
                    Siguiente: Equipamiento
                  </Button>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Equipamiento y Servicios</h3>
                  
                  {formData.spaceId && (
                    <div className="space-y-4">
                      {mockSpaces.find(s => s.id === formData.spaceId)?.equipment.map(equipment => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment}
                            checked={formData.equipment.includes(equipment)}
                            onCheckedChange={(checked) => handleEquipmentChange(equipment, !!checked)}
                          />
                          <Label htmlFor={equipment}>{equipment}</Label>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="catering"
                        checked={formData.catering}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, catering: !!checked }))}
                      />
                      <Label htmlFor="catering" className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4" />
                        Solicitar servicio de catering
                      </Label>
                    </div>

                    {formData.catering && (
                      <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Utensils className="h-5 w-5 text-orange-600" />
                            <h4 className="font-medium text-orange-800 dark:text-orange-200">
                              Configuración de Catering
                            </h4>
                          </div>

                          {/* Tipo de servicio y número de personas */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="serviceType">Tipo de servicio</Label>
                              <Select 
                                value={formData.cateringDetails.serviceType} 
                                onValueChange={(value) => updateCateringDetail('serviceType', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cocktail">Cocktail / Aperitivo</SelectItem>
                                  <SelectItem value="almuerzo">Almuerzo</SelectItem>
                                  <SelectItem value="cena">Cena</SelectItem>
                                  <SelectItem value="coffee-break">Coffee Break</SelectItem>
                                  <SelectItem value="brunch">Brunch</SelectItem>
                                  <SelectItem value="buffet">Buffet</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="numberOfPeople">Número de personas</Label>
                              <Input
                                id="numberOfPeople"
                                type="number"
                                min="1"
                                value={formData.cateringDetails.numberOfPeople || ''}
                                onChange={(e) => updateCateringDetail('numberOfPeople', parseInt(e.target.value) || 0)}
                                placeholder="Ej: 50"
                              />
                            </div>
                          </div>

                          {/* Horarios del servicio */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="serviceStartTime">Inicio del servicio</Label>
                              <Input
                                id="serviceStartTime"
                                type="time"
                                value={formData.cateringDetails.serviceStartTime}
                                onChange={(e) => updateCateringDetail('serviceStartTime', e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="serviceEndTime">Fin del servicio</Label>
                              <Input
                                id="serviceEndTime"
                                type="time"
                                value={formData.cateringDetails.serviceEndTime}
                                onChange={(e) => updateCateringDetail('serviceEndTime', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Tipo de menú */}
                          <div className="space-y-2">
                            <Label htmlFor="menuType">Tipo de menú</Label>
                            <Select 
                              value={formData.cateringDetails.menuType} 
                              onValueChange={(value) => updateCateringDetail('menuType', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar menú" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ejecutivo">Menú Ejecutivo</SelectItem>
                                <SelectItem value="gourmet">Menú Gourmet</SelectItem>
                                <SelectItem value="vegetariano">Menú Vegetariano</SelectItem>
                                <SelectItem value="vegano">Menú Vegano</SelectItem>
                                <SelectItem value="internacional">Cocina Internacional</SelectItem>
                                <SelectItem value="argentino">Menú Argentino</SelectItem>
                                <SelectItem value="picada">Picada & Tapas</SelectItem>
                                <SelectItem value="personalizado">Personalizado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Restricciones alimentarias */}
                          <div className="space-y-3">
                            <Label>Restricciones alimentarias</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                'Sin gluten (Celíaco)',
                                'Sin lactosa',
                                'Vegetariano',
                                'Vegano',
                                'Sin frutos secos',
                                'Sin mariscos',
                                'Diabético',
                                'Sin alcohol',
                                'Halal',
                                'Kosher'
                              ].map(restriction => (
                                <div key={restriction} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={restriction}
                                    checked={formData.cateringDetails.dietaryRestrictions.includes(restriction)}
                                    onCheckedChange={(checked) => handleDietaryRestrictionChange(restriction, !!checked)}
                                  />
                                  <Label htmlFor={restriction} className="text-sm">
                                    {restriction}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Rango presupuestario */}
                          <div className="space-y-2">
                            <Label htmlFor="budgetRange">Rango presupuestario por persona</Label>
                            <Select 
                              value={formData.cateringDetails.budgetRange} 
                              onValueChange={(value) => updateCateringDetail('budgetRange', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rango" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="economico">Económico ($2,000 - $3,500)</SelectItem>
                                <SelectItem value="medio">Medio ($3,500 - $5,000)</SelectItem>
                                <SelectItem value="premium">Premium ($5,000 - $8,000)</SelectItem>
                                <SelectItem value="luxury">Luxury ($8,000+)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Solicitudes especiales */}
                          <div className="space-y-2">
                            <Label htmlFor="specialRequests">Solicitudes especiales</Label>
                            <Textarea
                              id="specialRequests"
                              value={formData.cateringDetails.specialRequests}
                              onChange={(e) => updateCateringDetail('specialRequests', e.target.value)}
                              placeholder="Decoración de mesa, servicio especializado, equipo adicional, etc."
                              rows={3}
                            />
                          </div>

                          {/* Checklist de catering */}
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                            <h5 className="font-medium mb-2 text-orange-800 dark:text-orange-200">
                              Checklist de Catering:
                            </h5>
                            <div className="grid grid-cols-1 gap-1 text-sm">
                              <div className={`flex items-center gap-2 ${formData.cateringDetails.serviceType ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formData.cateringDetails.serviceType ? '✅' : '⏳'} Tipo de servicio definido
                              </div>
                              <div className={`flex items-center gap-2 ${formData.cateringDetails.numberOfPeople > 0 ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formData.cateringDetails.numberOfPeople > 0 ? '✅' : '⏳'} Número de personas especificado
                              </div>
                              <div className={`flex items-center gap-2 ${formData.cateringDetails.serviceStartTime ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formData.cateringDetails.serviceStartTime ? '✅' : '⏳'} Horarios de servicio definidos
                              </div>
                              <div className={`flex items-center gap-2 ${formData.cateringDetails.menuType ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formData.cateringDetails.menuType ? '✅' : '⏳'} Tipo de menú seleccionado
                              </div>
                              <div className={`flex items-center gap-2 ${formData.cateringDetails.budgetRange ? 'text-green-700 dark:text-green-300' : 'text-orange-600 dark:text-orange-400'}`}>
                                {formData.cateringDetails.budgetRange ? '✅' : '⏳'} Presupuesto definido
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción del evento</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe tu evento en detalle..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFormStep(1)}>
                      Anterior
                    </Button>
                    <Button onClick={() => setFormStep(3)} className="flex-1">
                      Siguiente: Presupuesto
                    </Button>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Presupuesto y Documentos</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">Presupuesto propuesto ($)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                      placeholder="Ingresa tu presupuesto estimado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Documentos adjuntos (Demo)</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Planos, riders técnicos, documentos de identidad, etc.
                      </p>
                    </div>
                  </div>

                  {formData.budget > 10000 && (
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                            Pago de Seña Requerido
                          </h4>
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Para presupuestos superiores a $10,000 se requiere una seña del 30% (${calculateDeposit().toLocaleString()})
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Checklist de requisitos:</h4>
                    <ul className="text-sm space-y-1">
                      <li>✓ Tipo de evento definido</li>
                      <li>✓ Fecha y duración especificadas</li>
                      <li>✓ Espacio seleccionado</li>
                      <li>✓ Equipamiento necesario</li>
                      <li>✓ Número de asistentes</li>
                      <li>✓ Presupuesto propuesto</li>
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setFormStep(2)}>
                      Anterior
                    </Button>
                    <Button onClick={handleFormSubmit} className="flex-1">
                      {formData.budget > 10000 ? 'Proceder al Pago' : 'Enviar Solicitud'}
                    </Button>
                  </div>
                </div>
              )}

              {formStep === 4 && requiresDeposit && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <CreditCard className="h-12 w-12 mx-auto text-blue-500" />
                    <h3 className="font-medium">Pago de Seña Requerido</h3>
                    <p className="text-sm text-muted-foreground">
                      Para presupuestos superiores a $10,000 se requiere una seña del 30%
                    </p>
                  </div>

                  {/* Deposit Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Resumen de Seña
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Presupuesto total:</span>
                          <span>${formData.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Porcentaje de seña:</span>
                          <span>30%</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-medium text-lg">
                          <span>Seña a pagar ahora:</span>
                          <span className="text-blue-600">${depositAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Restante al confirmar:</span>
                          <span>${(formData.budget - depositAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reservation Details */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-blue-800 dark:text-blue-200">
                        Detalles de la Reserva
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Evento:</span>
                        <span>{formData.eventType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{formData.date && format(formData.date, "PPP", { locale: es })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duración:</span>
                        <span>{formData.duration} horas</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Asistentes:</span>
                        <span>{formData.attendees} personas</span>
                      </div>
                      {formData.catering && (
                        <div className="flex justify-between">
                          <span>Catering:</span>
                          <span>Incluido ({formData.cateringDetails.serviceType})</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Terms */}
                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium text-amber-800 dark:text-amber-200">
                          Condiciones de Pago
                        </h4>
                      </div>
                      <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                        <li>• La seña confirma tu reserva y bloquea el espacio</li>
                        <li>• El saldo restante se abona 48hs antes del evento</li>
                        <li>• La seña es reembolsable hasta 72hs antes del evento</li>
                        <li>• Incluye procesamiento seguro con MercadoPago/Stripe</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setFormStep(3)}
                      className="flex-1"
                    >
                      Volver
                    </Button>
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={handleDepositPayment}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Seña ${depositAmount.toLocaleString()}
                    </Button>
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setRequiresDeposit(false);
                        submitReservation();
                      }}
                    >
                      Enviar sin seña (sujeto a aprobación)
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {canManageReservations && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReservations.map(reservation => {
                  const StatusIcon = statusIcons[reservation.status];
                  return (
                    <div key={reservation.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{reservation.eventType}</h3>
                            <Badge className={`${statusColors[reservation.status]} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusLabels[reservation.status]}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>Fecha: {new Date(reservation.date).toLocaleDateString('es-AR')}</div>
                            <div>Duración: {reservation.duration}h</div>
                            <div>Asistentes: {reservation.attendees}</div>
                            <div>Precio: ${reservation.totalPrice.toLocaleString()}</div>
                          </div>
                        </div>

                        {reservation.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleReservationAction(reservation.id, 'accept')}>
                              Aceptar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReservationAction(reservation.id, 'counter')}
                            >
                              Contraoferta
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleReservationAction(reservation.id, 'reject')}
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spaces Available */}
        <div>
          <h2 className="mb-4">Espacios Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockSpaces.map(space => (
              <Card key={space.id} className="overflow-hidden">
                <ImageWithFallback
                  src={space.image}
                  alt={space.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {space.name}
                    <Badge variant="outline">Cap: {space.capacity}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Equipamiento incluido:</h4>
                    <div className="flex flex-wrap gap-1">
                      {space.equipment.map(eq => (
                        <Badge key={eq} variant="secondary" className="text-xs">
                          {eq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">${space.pricePerHour.toLocaleString()}/hora</span>
                    {isClient && (
                      <Button size="sm" onClick={() => setShowForm(true)}>
                        Reservar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  );
};