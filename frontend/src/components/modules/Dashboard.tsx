import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { useApp } from '../../contexts/AppContext';
import {
  API_URL,
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  createManualOrder,
  EventPayload,
  EventResponse,
  uploadFile,
} from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Progress } from '../ui/progress';
import { toast } from 'sonner@2.0.3';
import {
  BarChart3,
  CalendarClock,
  CalendarPlus,
  MapPin,
  Pencil,
  Plus,
  RefreshCcw,
  Ticket,
  Trash2,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import type { Event, TicketType } from '../../data/mockData';

type EventStatus = Event['status'];

type NormalizedTicketType = Omit<
  TicketType,
  'description' | 'price' | 'total' | 'sold' | 'available' | 'manualSold'
> & {
  description?: string | null;
  price: number;
  total: number;
  sold: number;
  manualSold: number;
  available: number;
  perks?: string[] | null;
};

type AdminEvent = Omit<
  EventResponse,
  'ticketTypes' | 'price' | 'capacity' | 'ticketsSold'
> & {
  price: number;
  capacity: number;
  ticketsSold: number;
  ticketTypes: NormalizedTicketType[];
  totalSold: number;
  totalCapacity: number;
  totalRevenue: number;
};

type EventFormTicket = {
  id?: string;
  name: string;
  description?: string;
  price: string;
  total: string;
  sold: string;
  manualSold: string;
};

type EventFormState = {
  title: string;
  description: string;
  date: string;
  time: string;
  space: string;
  capacity: string;
  price: string;
  status: EventStatus;
  category: string;
  image?: string;
  featured: string;
  ticketTypes: EventFormTicket[];
};

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'upcoming', label: 'Próximo' },
  { value: 'in-progress', label: 'En curso' },
  { value: 'sold-out', label: 'Agotado' },
  { value: 'ended', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const statusBadges: Record<
  EventStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  'upcoming': { label: 'Próximo', variant: 'default' },
  'in-progress': { label: 'En curso', variant: 'secondary' },
  'sold-out': { label: 'Agotado', variant: 'destructive' },
  'ended': { label: 'Finalizado', variant: 'outline' },
  'cancelled': { label: 'Cancelado', variant: 'destructive' },
};

const emptyTicket: EventFormTicket = {
  name: '',
  description: '',
  price: '',
  total: '',
  sold: '0',
  manualSold: '0',
};

const CATEGORY_OPTIONS = [
  'Música',
  'Arte',
  'Taller',
  'Entretenimiento',
  'Gastronomía',
  'Fiesta',
  'Cine',
  'Teatro',
  'Otro',
];

const defaultFormState: EventFormState = {
  title: '',
  description: '',
  date: '',
  time: '',
  space: '',
  capacity: '',
  price: '',
  status: 'upcoming',
  category: '',
  image: '',
  featured: 'false',
  ticketTypes: [{ ...emptyTicket }],
};

const numberFrom = (value: unknown, fallback = 0) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;
    // remove thousands separators and normalise decimal comma to dot
    const normalized = trimmed
      .replace(/\s+/g, '')
      .replace(/\.(?=\d{3}(?:\D|$))/g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const errorMessageFrom = (err: unknown, fallback: string) => {
  const message =
    (err as any)?.response?.data?.message ?? (err as any)?.message ?? fallback;
  return Array.isArray(message) ? message.join(', ') : String(message);
};

const normalizeEvent = (event: EventResponse): AdminEvent => {
  const ticketTypes: NormalizedTicketType[] = (event.ticketTypes || []).map((ticket) => {
    const price = numberFrom(ticket.price);
    const total = numberFrom(ticket.total);
    const sold = numberFrom(ticket.sold);
    const manualSold = numberFrom((ticket as any).manualSold);
    const available =
      ticket.available != null
        ? numberFrom(ticket.available)
        : Math.max(total - sold, 0);

    return {
      ...ticket,
      description: ticket.description ?? '',
      price,
      total,
      sold,
      manualSold,
      available,
      perks: ticket.perks ?? null,
    };
  });

  const totalSold = ticketTypes.reduce((sum, ticket) => sum + numberFrom(ticket.sold), 0);
  const totalCapacity = ticketTypes.reduce(
    (sum, ticket) => sum + numberFrom(ticket.total),
    0,
  );
  const totalRevenue = ticketTypes.reduce(
    (sum, ticket) => sum + numberFrom(ticket.sold) * numberFrom(ticket.price),
    0,
  );

  return {
    ...event,
    price: numberFrom(event.price),
    capacity: numberFrom(event.capacity),
    ticketsSold: numberFrom(event.ticketsSold ?? totalSold),
    ticketTypes,
    totalSold,
    totalCapacity,
    totalRevenue,
  };
};

const formatDateInput = (value?: string | null) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const isoMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})[T\s]?/);
  if (isoMatch?.[1]) {
    return isoMatch[1];
  }
  const dayFirstMatch = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch;
    return `${year}-${month}-${day}`;
  }
  try {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  } catch {
    /* ignore parse errors */
  }
  return '';
};

const formatTimeInput = (value?: string | null) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const secondsMatch = trimmed.match(/^(\d{2}:\d{2}):\d{2}(?:\.\d+)?(?:Z)?$/);
  if (secondsMatch?.[1]) {
    return secondsMatch[1];
  }
  const isoMatch = trimmed.match(/T(\d{2}:\d{2})/);
  if (isoMatch?.[1]) {
    return isoMatch[1];
  }
  try {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(11, 16);
    }
  } catch {
    /* ignore parse errors */
  }
  return '';
};

const buildFormState = (event?: AdminEvent | null): EventFormState => {
  if (!event) return { ...defaultFormState, ticketTypes: [{ ...emptyTicket }] };

  const tickets =
    event.ticketTypes.length > 0
      ? event.ticketTypes.map((ticket) => ({
          id: ticket.id,
          name: ticket.name,
          description: ticket.description ?? '',
          price: String(ticket.price ?? ''),
          total: String(ticket.total ?? ''),
          sold: String(ticket.sold ?? 0),
          manualSold: String(ticket.manualSold ?? 0),
        }))
      : [{ ...emptyTicket }];

  return {
    title: event.title,
    description: event.description,
    date: formatDateInput(event.date),
    time: formatTimeInput(event.time),
    space: event.space,
    capacity: String(event.capacity || ''),
    price: String(event.price || ''),
    status: event.status as EventStatus,
    category: event.category,
    image: event.image ?? '',
    featured: event.featured ? 'true' : 'false',
    ticketTypes: tickets,
  };
};

const formatEventDate = (date: string) => {
  if (!date) return 'Sin fecha';
  try {
    const formatter = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return formatter.format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);

const MetricCard: React.FC<{
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
}> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);
interface EventFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialEvent?: AdminEvent | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: EventPayload) => Promise<void>;
  saving: boolean;
}

const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  mode,
  initialEvent,
  onOpenChange,
  onSubmit,
  saving,
}) => {
  const [form, setForm] = useState<EventFormState>(() => buildFormState(initialEvent));
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildFormState(initialEvent));
    }
  }, [open, initialEvent]);

  const imagePreview = useMemo(() => {
    if (!form.image) return null;
    if (form.image.startsWith('http') || form.image.startsWith('data:')) {
      return form.image;
    }
    const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const normalizedPath = form.image.startsWith('/') ? form.image : `/${form.image}`;
    return `${base}${normalizedPath}`;
  }, [form.image]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      setUploadingImage(true);
      try {
        const uploaded = await uploadFile(file);
        setForm((prev) => ({
          ...prev,
          image: uploaded.url || uploaded.path || '',
        }));
        toast.success('Imagen subida correctamente.');
      } catch (err) {
        toast.error(errorMessageFrom(err, 'No se pudo subir la imagen.'));
      } finally {
        setUploadingImage(false);
      }
    },
    [setForm, uploadFile],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      void handleImageUpload(acceptedFiles[0]);
    },
    [handleImageUpload],
  );

  const onDropRejected = useCallback((rejections: FileRejection[]) => {
    const errorCode = rejections?.[0]?.errors?.[0]?.code;
    if (errorCode === 'file-too-large') {
      toast.error('La imagen supera el limite de 10 MB.');
    } else if (errorCode === 'file-invalid-type') {
      toast.error('Formato de imagen no soportado.');
    } else {
      toast.error('No se pudo subir la imagen.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
    disabled: uploadingImage,
  });

  const updateField = (field: keyof EventFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateTicket = (
    index: number,
    field: keyof EventFormTicket,
    value: string,
  ) => {
    setForm((prev) => {
      const nextTickets = [...prev.ticketTypes];
      const current = { ...nextTickets[index], [field]: value };

      if (field === 'total') {
        const total = numberFrom(value, 0);
        const sold = numberFrom(current.sold, 0);
        const manualSold = numberFrom(current.manualSold, 0);
        const used = sold + manualSold;
        if (manualSold > Math.max(0, total - sold)) {
          current.manualSold = String(Math.max(0, total - sold));
        }
      }
      if (field === 'manualSold') {
        const manualSold = numberFrom(value, 0);
        const total = numberFrom(current.total, 0);
        const sold = numberFrom(current.sold, 0);
        if (manualSold + sold > total) {
          current.manualSold = String(Math.max(0, total - sold));
        }
      }

      nextTickets[index] = current;
      return { ...prev, ticketTypes: nextTickets };
    });
  };

  const addTicketType = () => {
    setForm((prev) => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, { ...emptyTicket }],
    }));
  };

  const removeTicketType = (index: number) => {
    setForm((prev) => {
      if (prev.ticketTypes.length === 1) {
        toast.error('El evento debe tener al menos un tipo de ticket.');
        return prev;
      }
      const nextTickets = prev.ticketTypes.filter((_, i) => i !== index);
      return { ...prev, ticketTypes: nextTickets };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('El evento debe tener un título.');
      return;
    }
    if (!form.date) {
      toast.error('Selecciona una fecha para el evento.');
      return;
    }
    if (!form.time) {
      toast.error('Selecciona un horario para el evento.');
      return;
    }
    if (!form.category.trim()) {
      toast.error('Indica la categoría del evento.');
      return;
    }
    if (form.ticketTypes.some((ticket) => !ticket.name.trim())) {
      toast.error('Todos los tipos de ticket deben tener un nombre.');
      return;
    }

    const ticketTypes: EventPayload['ticketTypes'] = form.ticketTypes.map(
      (ticket) => {
        const total = numberFrom(ticket.total, 0);
        const manualSold = numberFrom(ticket.manualSold, 0);
        return {
          id: ticket.id,
          name: ticket.name.trim(),
          description: ticket.description?.trim() || undefined,
          price: numberFrom(ticket.price, 0),
          total,
          manualSold,
          available: Math.max(total - manualSold, 0),
        };
      },
    );

    if (ticketTypes.some((ticket) => ticket.total <= 0)) {
      toast.error('La capacidad de cada ticket debe ser mayor a cero.');
      return;
    }

    const payload: EventPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time,
      space: form.space.trim(),
      capacity: numberFrom(form.capacity, ticketTypes.reduce((sum, t) => sum + t.total, 0)),
      price: numberFrom(
        form.price,
        ticketTypes.length ? ticketTypes[0].price : 0,
      ),
      status: form.status,
      category: form.category.trim(),
      image: form.image?.trim() || null,
      featured: form.featured === 'true',
      ticketTypes,
    };

    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch {
      /* el padre ya muestra el error */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Crear nuevo evento' : 'Editar evento'}
          </DialogTitle>
          <DialogDescription>
            Completa la información para publicar el evento y sus tickets.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pb-4 pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Nombre del evento"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={CATEGORY_OPTIONS.includes(form.category) ? form.category : (form.category ? '__custom__' : '')}
                onValueChange={(value) => {
                  if (value === '__custom__') {
                    updateField('category', form.category && !CATEGORY_OPTIONS.includes(form.category) ? form.category : '');
                  } else {
                    updateField('category', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(!CATEGORY_OPTIONS.includes(form.category) || form.category === '') && (
                <Input
                  id="category-custom"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  placeholder="Otra categoría"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => updateField('date', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={form.time}
                onChange={(event) => updateField('time', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space">Espacio / sala</Label>
              <Input
                id="space"
                value={form.space}
                onChange={(event) => updateField('space', event.target.value)}
                placeholder="Salón principal, Terraza..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(value: EventStatus) => updateField('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad total</Label>
              <Input
                id="capacity"
                type="number"
                min={0}
                value={form.capacity}
                onChange={(event) => updateField('capacity', event.target.value)}
                placeholder="Ej: 250"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio base</Label>
              <Input
                id="price"
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                placeholder="Precio de referencia"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="image">Imagen destacada</Label>
              <Input
                id="image"
                value={form.image ?? ''}
                onChange={(event) => updateField('image', event.target.value)}
                placeholder="https://..."
              />
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-sm transition ${
                  uploadingImage
                    ? 'cursor-wait border-muted-foreground/50 bg-muted/40 text-muted-foreground'
                    : isDragActive
                    ? 'cursor-copy border-primary bg-primary/10 text-primary'
                    : 'cursor-pointer border-muted-foreground/40 text-muted-foreground hover:border-primary/60 hover:text-primary'
                }`}
              >
                <input {...getInputProps()} />
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Subiendo imagen...</span>
                  </>
                ) : (
                  <>
                    <p className="text-center font-medium">Arrastra una imagen o haz clic para subir</p>
                    <p className="text-center text-xs text-muted-foreground">
                      Formatos admitidos: JPG, PNG, WEBP (max. 10 MB)
                    </p>
                  </>
                )}
              </div>
              {imagePreview && (
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-16 w-16 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{form.image}</p>
                    <p className="text-xs text-muted-foreground">Vista previa</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => updateField('image', '')}
                    >
                      Quitar
                    </Button>
                    <a
                      href={imagePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ver imagen
                    </a>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured">Destacado</Label>
              <Select
                value={form.featured}
                onValueChange={(value) => updateField('featured', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">No</SelectItem>
                  <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Detalles del evento, artistas invitados, dinámica..."
              rows={5}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Tipos de tickets</Label>
              <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar tipo
              </Button>
            </div>
            <div className="space-y-4">
              {form.ticketTypes.map((ticket, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base">
                        {ticket.name || `Tipo ${index + 1}`}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Configura disponibilidad y precio de este tipo de entrada.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTicketType(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={ticket.name}
                        onChange={(event) =>
                          updateTicket(index, 'name', event.target.value)
                        }
                        placeholder="General, VIP, Preventa..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio</Label>
                      <Input
                        type="number"
                        min={0}
                        value={ticket.price}
                        onChange={(event) =>
                          updateTicket(index, 'price', event.target.value)
                        }
                        placeholder="Ej: 12000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cupos totales</Label>
                      <Input
                        type="number"
                        min={0}
                        value={ticket.total}
                        onChange={(event) =>
                          updateTicket(index, 'total', event.target.value)
                        }
                        placeholder="Ej: 150"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ventas web (auto)</Label>
                      <Input
                        type="number"
                        value={ticket.sold}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Calculado en tiempo real desde las órdenes aprobadas.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Ventas manuales (efectivo/puerta)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={ticket.manualSold}
                        onChange={(event) =>
                          updateTicket(index, 'manualSold', event.target.value)
                        }
                        placeholder="Ej: 5"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Asentá ventas que cobraste fuera de la web para que descuenten del stock.
                      </p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Descripción (opcional)</Label>
                      <Input
                        value={ticket.description}
                        onChange={(event) =>
                          updateTicket(index, 'description', event.target.value)
                        }
                        placeholder="Incluye beneficios o condiciones..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear evento' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
interface ManualTicketDialogProps {
  open: boolean;
  event: AdminEvent | null;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const ManualTicketDialog: React.FC<ManualTicketDialogProps> = ({ open, event, onOpenChange, onCreated }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [buyerEmail, setBuyerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantities({});
      setBuyerEmail('');
      setNotes('');
    }
  }, [open]);

  if (!event) return null;

  const total = event.ticketTypes.reduce((sum, ticket) => {
    const qty = quantities[ticket.id ?? ticket.name] || 0;
    return sum + qty * ticket.price;
  }, 0);

  const totalTickets = Object.values(quantities).reduce((s, n) => s + n, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTickets <= 0) {
      toast.error('Selecciona al menos un ticket.');
      return;
    }
    const items = event.ticketTypes
      .map((ticket) => ({
        ticketTypeId: ticket.id!,
        eventId: event.id,
        quantity: quantities[ticket.id ?? ticket.name] || 0,
      }))
      .filter((i) => i.quantity > 0);

    setSubmitting(true);
    try {
      await createManualOrder({
        buyerEmail: buyerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
        items,
      });
      toast.success('Venta manual registrada. Stock actualizado.');
      onCreated();
      onOpenChange(false);
    } catch (err) {
      toast.error(errorMessageFrom(err, 'No se pudo registrar la venta manual.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Venta manual · {event.title}</DialogTitle>
          <DialogDescription>
            Registra entradas vendidas en efectivo o por fuera de la plataforma. Se descuenta del stock automáticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {event.ticketTypes.map((ticket) => {
              const key = ticket.id ?? ticket.name;
              const remaining = Math.max(0, ticket.total - ticket.sold - ticket.manualSold);
              return (
                <Card key={key}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{ticket.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(ticket.price)} · Disponibles: {remaining}
                      </div>
                    </div>
                    <Input
                      type="number"
                      min={0}
                      max={remaining}
                      value={quantities[key] ?? 0}
                      onChange={(e) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [key]: Math.min(remaining, Math.max(0, Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-24"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-email">Email del comprador (opcional)</Label>
            <Input
              id="manual-email"
              type="email"
              placeholder="comprador@ejemplo.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Si lo agregás, le mandamos el email con el QR.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-notes">Notas internas</Label>
            <Textarea
              id="manual-notes"
              placeholder="Detalle de la venta (ej. pago en efectivo)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="rounded-md border bg-muted p-3 flex items-center justify-between">
            <span className="text-sm font-medium">Total cobrado</span>
            <span className="text-lg font-semibold">{formatCurrency(total)}</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || totalTickets <= 0}>
              {submitting ? 'Registrando...' : `Registrar ${totalTickets || 0} ticket${totalTickets === 1 ? '' : 's'}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const Dashboard: React.FC = () => {
  const { currentRole } = useApp();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'events' | 'sales'>('overview');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualEvent, setManualEvent] = useState<AdminEvent | null>(null);

  const isAuthorized = ['admin', 'operaciones'].includes(currentRole);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents();
      const normalized = data.map(normalizeEvent).sort((a, b) => {
        const da = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}:00`).getTime();
        const db = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}:00`).getTime();
        return db - da;
      });
      setEvents(normalized);
    } catch (err) {
      setError(errorMessageFrom(err, 'No se pudieron cargar los eventos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadEvents();
    }
  }, [isAuthorized, loadEvents]);

  const openCreateEvent = () => {
    setFormMode('create');
    setSelectedEvent(null);
    setFormOpen(true);
  };

  const openEditEvent = (event: AdminEvent) => {
    setFormMode('edit');
    setSelectedEvent(event);
    setFormOpen(true);
  };

  const handleSubmitEvent = async (payload: EventPayload) => {
    setSavingEvent(true);
    try {
      if (formMode === 'create') {
        await createEvent(payload);
        toast.success('Evento creado correctamente.');
      } else if (selectedEvent) {
        await updateEvent(selectedEvent.id, payload);
        toast.success('Evento actualizado correctamente.');
      }
      await loadEvents();
      setSelectedEvent(null);
    } catch (err) {
      toast.error(errorMessageFrom(err, 'No se pudo guardar el evento.'));
      throw err;
    } finally {
      setSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    setDeletingId(eventId);
    try {
      await deleteEvent(eventId);
      toast.success('Evento eliminado.');
      await loadEvents();
    } catch (err) {
      toast.error(errorMessageFrom(err, 'No se pudo eliminar el evento.'));
    } finally {
      setDeletingId(null);
    }
  };

  const overviewMetrics = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter((event) => event.status === 'upcoming').length;
    const totalTicketsSold = events.reduce((sum, event) => sum + event.totalSold, 0);
    const totalRevenue = events.reduce((sum, event) => sum + event.totalRevenue, 0);
    const averageOccupancy =
      events.length === 0
        ? 0
        : Math.round(
            events.reduce((sum, event) => {
              if (event.totalCapacity === 0) return sum;
              return sum + (event.totalSold / event.totalCapacity) * 100;
            }, 0) / events.length,
          );

    return {
      totalEvents,
      upcomingEvents,
      totalTicketsSold,
      totalRevenue,
      averageOccupancy,
    };
  }, [events]);

  const topSellingEvents = useMemo(
    () =>
      [...events]
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 3),
    [events],
  );

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-lg mx-auto text-center space-y-4 rounded-lg border border-dashed p-10">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">Acceso restringido</h2>
          <p className="text-muted-foreground">
            Solo las cuentas administradoras y el equipo de operaciones pueden ingresar al panel
            de administración.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)} className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Panel de administración</h1>
            <p className="text-muted-foreground">
              Gestiona eventos, tickets y visualiza el desempeño de ventas.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="sales">Ventas</TabsTrigger>
            </TabsList>
            <Button onClick={openCreateEvent} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo evento
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Eventos activos"
              value={overviewMetrics.totalEvents.toString()}
              description="Total de eventos publicados"
              icon={<CalendarClock className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Próximos eventos"
              value={overviewMetrics.upcomingEvents.toString()}
              description="Eventos programados en agenda"
              icon={<CalendarPlus className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Entradas vendidas"
              value={overviewMetrics.totalTicketsSold.toLocaleString()}
              description="Volumen acumulado en todos los eventos"
              icon={<Ticket className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="Ingresos estimados"
              value={formatCurrency(overviewMetrics.totalRevenue)}
              description="Suma de ventas por tipo de ticket"
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Ocupación promedio</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Porcentaje promedio de ocupación considerando todos los eventos con tickets activos.
                </p>
              </div>
              <div className="text-3xl font-semibold">
                {overviewMetrics.averageOccupancy}%
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={overviewMetrics.averageOccupancy} className="h-3" />
              <div className="grid gap-4 md:grid-cols-3">
                {events.slice(0, 3).map((event) => {
                  const occupancy =
                    event.totalCapacity === 0
                      ? 0
                      : Math.round((event.totalSold / event.totalCapacity) * 100);
                  return (
                    <div
                      key={event.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium line-clamp-1">{event.title}</span>
                        <Badge variant={statusBadges[event.status].variant}>
                          {statusBadges[event.status].label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatEventDate(event.date)} · {event.time}
                      </div>
                      <div>
                        <Progress value={occupancy} />
                        <p className="text-xs text-muted-foreground mt-2">
                          {occupancy}% de ocupación ({event.totalSold}/{event.totalCapacity} tickets)
                        </p>
                      </div>
                    </div>
                  );
                })}

                {events.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aún no hay eventos registrados. Crea tu primer evento para ver métricas.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eventos destacados por ventas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topSellingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Registra eventos para comenzar a ver cuáles se venden mejor.
                </p>
              )}
              {topSellingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.totalSold} tickets · {formatCurrency(event.totalRevenue)}
                    </div>
                  </div>
                  <Badge variant="secondary">#{events.indexOf(event) + 1}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCcw className="h-4 w-4" />
              <button
                type="button"
                onClick={loadEvents}
                className="hover:underline font-medium"
              >
                Actualizar lista
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {events.length} eventos registrados
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>No se pudo cargar la información</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && events.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const occupancy =
                  event.totalCapacity === 0
                    ? 0
                    : Math.round((event.totalSold / event.totalCapacity) * 100);
                return (
                  <Card key={event.id} className="flex flex-col">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg leading-tight">
                            {event.title}
                          </CardTitle>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <CalendarClock className="h-3 w-3" />
                            {formatEventDate(event.date)} · {event.time}
                          </div>
                        </div>
                        <Badge variant={statusBadges[event.status].variant}>
                          {statusBadges[event.status].label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {event.space || 'Espacio por confirmar'}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg border p-3 space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            Capacidad
                          </div>
                          <div className="text-sm font-semibold">
                            {event.totalCapacity}
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Ticket className="h-3.5 w-3.5" />
                            Vendidos
                          </div>
                          <div className="text-sm font-semibold">
                            {event.totalSold}
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-3.5 w-3.5" />
                            Ingresos
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(event.totalRevenue)}
                          </div>
                        </div>
                        <div className="rounded-lg border p-3 space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Ocupación
                          </div>
                          <div className="text-sm font-semibold">{occupancy}%</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditEvent(event)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setManualEvent(event);
                            setManualDialogOpen(true);
                          }}
                          disabled={event.totalCapacity === 0 || event.totalCapacity - event.totalSold <= 0}
                        >
                          <Ticket className="h-4 w-4 mr-2" />
                          Venta manual
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={deletingId === event.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar evento</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará de forma permanente el evento "
                                {event.title}" y todos sus tipos de tickets. ¿Deseas continuar?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deletingId === event.id}
                              >
                                Confirmar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {!loading && events.length === 0 && !error && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-4">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No hay eventos registrados todavía. Crea uno nuevo para comenzar.
                </p>
                <Button onClick={openCreateEvent}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear evento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de ventas por evento</CardTitle>
              <p className="text-sm text-muted-foreground">
                Visualiza el desempeño de cada evento y el detalle de sus tickets.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Cuando registres eventos aparecerá aquí el seguimiento de ventas.
                </p>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Evento</TableHead>
                          <TableHead>Ingresos</TableHead>
                          <TableHead>Tickets vendidos</TableHead>
                          <TableHead>Ocupación</TableHead>
                          <TableHead>Tipos de ticket</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => {
                          const occupancy =
                            event.totalCapacity === 0
                              ? 0
                              : Math.round(
                                  (event.totalSold / event.totalCapacity) * 100,
                                );
                          return (
                            <TableRow key={event.id}>
                              <TableCell>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatEventDate(event.date)} · {event.time}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">
                                  {formatCurrency(event.totalRevenue)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {event.totalSold} / {event.totalCapacity || '8'}
                              </TableCell>
                              <TableCell className="w-48">
                                <Progress value={occupancy} />
                                <span className="text-xs text-muted-foreground">
                                  {occupancy}%
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-xs">
                                  {event.ticketTypes.map((ticket) => (
                                    <div
                                      key={ticket.id ?? ticket.name}
                                      className="flex items-center justify-between gap-3 rounded border px-2 py-1"
                                    >
                                      <span className="font-medium">{ticket.name}</span>
                                      <span className="text-muted-foreground">
                                        {ticket.sold}/{ticket.total}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventFormDialog
        open={formOpen}
        mode={formMode}
        initialEvent={selectedEvent}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setSelectedEvent(null);
          }
        }}
        onSubmit={handleSubmitEvent}
        saving={savingEvent}
      />

      <ManualTicketDialog
        open={manualDialogOpen}
        event={manualEvent}
        onOpenChange={(open) => {
          setManualDialogOpen(open);
          if (!open) setManualEvent(null);
        }}
        onCreated={loadEvents}
      />
    </div>
  );
};
