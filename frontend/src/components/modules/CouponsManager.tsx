
import React, { useEffect, useMemo, useState } from 'react';
import {
  CouponMetricsResponse,
  CouponResponse,
  CouponType,
  CreateCouponPayload,
  PromoterDashboard,
  UpdateCouponPayload,
  CouponEventOption,
  deleteCoupon,
  fetchCouponMetrics,
  fetchCoupons,
  fetchCouponEventOptions,
  fetchMyCouponDashboard,
  fetchUsers,
  createCoupon,
  updateCoupon,
} from '../../lib/api';
import { useApp } from '../../contexts/AppContext';
import { User } from '../../data/mockData';
import { toast } from 'sonner@2.0.3';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import {
  BarChart3,
  Crown,
  Edit,
  Eye,
  Gift,
  Loader2,
  Percent,
  Plus,
  RefreshCw,
  ShieldCheck,
  TicketPercent,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';

type FormMode = 'create' | 'edit';

type FormState = {
  code: string;
  description: string;
  type: CouponType;
  value: string;
  hasLimit: boolean;
  maxRedemptions: string;
  promoterId: string;
  commissionRate: string;
  isActive: boolean;
  eventIds: string[];
};
const initialFormState: FormState = {
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: '10',
  hasLimit: false,
  maxRedemptions: '',
  promoterId: '',
  commissionRate: '10',
  isActive: true,
  eventIds: [],
};

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat('es-AR', {
  maximumFractionDigits: 0,
});

const discountLabel = (coupon: { type: CouponType; value: number }) => {
  switch (coupon.type) {
    case 'FREE':
      return 'Entrada sin cargo';
    case 'AMOUNT':
      return `${currency.format(coupon.value)} off`;
    case 'PERCENTAGE':
    default:
      return `${coupon.value}% off`;
  }
};

const limitLabel = (limit?: number | null) =>
  limit == null ? 'Sin limite' : `${integerFormatter.format(limit)} tickets`;

const commissionLabel = (value?: number | null) =>
  value == null ? '0%' : `${Number(value).toFixed(2).replace(/\.00$/, '')}%`;

const findDashboardCoupon = (
  dashboard: PromoterDashboard | null,
  id: string,
) => dashboard?.coupons?.find((coupon) => coupon.id === id);

const normalizeUsersForPromoters = (users: User[]) =>
  users.filter((user) => ['admin', 'promotor'].includes(user.role));
const CouponsManager: React.FC = () => {
  const { currentRole } = useApp();
  const isAdmin = currentRole === 'admin';
  const isPromoter = currentRole === 'promotor';

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [dashboard, setDashboard] = useState<PromoterDashboard | null>(null);
  const [promoters, setPromoters] = useState<User[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | null>(null);
  const [metrics, setMetrics] = useState<CouponMetricsResponse | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [events, setEvents] = useState<CouponEventOption[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const promoterCoupons = useMemo(() => {
    if (!isPromoter || !dashboard) return [];
    return dashboard.coupons ?? [];
  }, [dashboard, isPromoter]);

  const activeCount = useMemo(
    () => coupons.filter((coupon) => coupon.isActive).length,
    [coupons],
  );

  const assignedCount = useMemo(
    () => coupons.filter((coupon) => coupon.promoter).length,
    [coupons],
  );

  const promoterCount = useMemo(() => {
    const ids = new Set<number>();
    coupons.forEach((coupon) => {
      if (coupon.promoter?.id) ids.add(Number(coupon.promoter.id));
    });
    return ids.size;
  }, [coupons]);

  const eventOptions = useMemo(() => {
    const map = new Map<string, CouponEventOption>();
    events.forEach((event) => {
      if (event.id) {
        map.set(event.id, event);
      }
    });
    if (selectedCoupon?.allowedEvents) {
      selectedCoupon.allowedEvents.forEach((event) => {
        if (event.id && !map.has(event.id)) {
          map.set(event.id, {
            id: event.id,
            title: event.title,
            date: event.date ?? null,
            time: event.time ?? null,
            status: null,
            space: null,
          });
        }
      });
    }
    return Array.from(map.values()).sort((a, b) => {
      const dateA = a.date ?? '';
      const dateB = b.date ?? '';
      if (dateA === dateB) {
        return (a.title ?? '').localeCompare(b.title ?? '');
      }
      return dateA.localeCompare(dateB);
    });
  }, [events, selectedCoupon]);

  const selectedEventIds = useMemo(() => new Set(formState.eventIds), [formState.eventIds]);

  const loadPromoters = async () => {
    try {
      const users = await fetchUsers();
      setPromoters(normalizeUsersForPromoters(users));
    } catch (error) {
      console.warn('No se pudieron cargar los usuarios promotores', error);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const list = await fetchCouponEventOptions();
      setEvents(list);
    } catch (error) {
      console.warn('No se pudieron cargar los eventos disponibles', error);
      toast.error('No pudimos cargar los eventos disponibles.');
    } finally {
      setEventsLoading(false);
    }
  };

  const loadData = async (withSpinner = true) => {
    if (withSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    try {
      const [couponList, promoterDashboard] = await Promise.all([
        fetchCoupons(),
        isPromoter ? fetchMyCouponDashboard() : Promise.resolve(null),
      ]);
      setCoupons(couponList);
      setDashboard(promoterDashboard);
    } catch (error) {
      toast.error('No pudimos obtener la informacion de cupones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    if (isAdmin) {
      loadEvents();
      loadPromoters();
    } else {
      setEvents([]);
    }
  }, [isAdmin, isPromoter]);

  const resetForm = () => {
    setFormState(initialFormState);
    setSelectedCoupon(null);
    setFormMode('create');
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (coupon: CouponResponse) => {
    setSelectedCoupon(coupon);
    setFormMode('edit');
    setFormState({
      code: coupon.code,
      description: coupon.description ?? '',
      type: coupon.type,
      value: coupon.type === 'FREE' ? '' : String(coupon.value ?? ''),
      hasLimit: coupon.maxRedemptions != null,
      maxRedemptions: coupon.maxRedemptions != null ? String(coupon.maxRedemptions) : '',
      promoterId: coupon.promoter?.id ? String(coupon.promoter.id) : '',
      commissionRate:
        coupon.promoter && coupon.commissionRate != null
          ? String(coupon.commissionRate)
          : coupon.promoter
          ? '0'
          : '',
      isActive: coupon.isActive,
      eventIds: Array.isArray(coupon.allowedEvents)
        ? coupon.allowedEvents.map((event) => event.id)
        : [],
    });
    setFormOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const closeForm = () => {
    handleDialogChange(false);
  };

  const handleDelete = async (coupon: CouponResponse) => {
    try {
      setDeletingId(coupon.id);
      await deleteCoupon(coupon.id);
      toast.success(`Cupon ${coupon.code} eliminado`);
      await loadData(false);
    } catch (error) {
      toast.error('No pudimos eliminar el cupon.');
    } finally {
      setDeletingId(null);
    }
  };
  const toggleEventSelection = (eventId: string, checked: boolean) => {
    setFormState((prev) => {
      const next = new Set(prev.eventIds);
      if (checked) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return { ...prev, eventIds: Array.from(next) };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.code.trim()) {
      toast.error('El codigo es obligatorio.');
      return;
    }

    if (formState.type !== 'FREE' && (!formState.value || Number(formState.value) <= 0)) {
      toast.error('Defini un valor de descuento valido.');
      return;
    }

    if (formState.hasLimit && (!formState.maxRedemptions || Number(formState.maxRedemptions) <= 0)) {
      toast.error('El limite de ventas debe ser mayor a cero.');
      return;
    }

    setSaving(true);
    const wantsPromoter = Boolean(formState.promoterId);
    const basePayload: CreateCouponPayload = {
      code: formState.code.trim().toUpperCase(),
      description: formState.description.trim() || undefined,
      type: formState.type,
      value: formState.type === 'FREE' ? undefined : Number(formState.value),
      isActive: formState.isActive,
    };
    const selectedEvents = formState.eventIds.filter((id) => id && id.length);
    if (selectedEvents.length > 0) {
      basePayload.eventIds = selectedEvents;
    }

    if (formState.hasLimit) {
      basePayload.maxRedemptions = Number(formState.maxRedemptions);
    }

    if (wantsPromoter) {
      basePayload.promoterId = Number(formState.promoterId);
      basePayload.commissionRate =
        formState.commissionRate !== '' ? Number(formState.commissionRate) : 0;
    }

    try {
      if (formMode === 'create') {
        await createCoupon(basePayload);
        toast.success('Cupon creado con exito.');
      } else if (selectedCoupon) {
        const payload: UpdateCouponPayload = { ...basePayload };
        if (selectedEvents.length === 0 && (selectedCoupon.allowedEvents?.length ?? 0) > 0) {
          payload.clearEvents = true;
          delete payload.eventIds;
        }

        if (!formState.hasLimit && selectedCoupon.maxRedemptions != null) {
          payload.clearLimit = true;
          delete payload.maxRedemptions;
        }

        if (!wantsPromoter && selectedCoupon.promoter) {
          payload.clearPromoter = true;
          delete payload.promoterId;
          delete payload.commissionRate;
        }

        await updateCoupon(selectedCoupon.id, payload);
        toast.success('Cupon actualizado.');
      }

      handleDialogChange(false);
      await loadData(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'No pudimos guardar el cupon.';
      toast.error(Array.isArray(message) ? message.join(' • ') : message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMetrics = async (coupon: CouponResponse) => {
    setSelectedCoupon(coupon);
    setMetricsOpen(true);
    setMetrics(null);
    setMetricsLoading(true);
    try {
      const data = await fetchCouponMetrics(coupon.id);
      setMetrics(data);
    } catch (error) {
      toast.error('No pudimos abrir las metricas del cupon.');
      setMetricsOpen(false);
    } finally {
      setMetricsLoading(false);
    }
  };

  const metricsSummary = metrics?.metrics;
  const promoterTotals = dashboard?.totals ?? null;
  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Gestion de cupones y promotores
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPromoter
              ? 'Consulta tus resultados y segui impulsando las ventas con tus codigos.'
              : 'Crea, asigna y controla codigos de descuento asociados a promotores.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadData(false)}
            disabled={refreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
          {isAdmin && (
            <Button onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo cupon
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isPromoter && promoterTotals ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas netas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {currency.format(promoterTotals.netRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sumatoria de ordenes aprobadas con tus cupones.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entradas vendidas</CardTitle>
                <TicketPercent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {integerFormatter.format(promoterTotals.tickets)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tickets asociados a tus codigos.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {currency.format(promoterTotals.commissionEarned)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculadas segun la comision asignada a cada cupon.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cupones activos</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">
                  {promoterTotals.coupons}
                </div>
                <p className="text-xs text-muted-foreground">
                  Codigos que podes compartir actualmente.
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cupones totales</CardTitle>
                <TicketPercent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{coupons.length}</div>
                <p className="text-xs text-muted-foreground">
                  Cantidad de codigos disponibles en el sistema.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Activos</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{activeCount}</div>
                <p className="text-xs text-muted-foreground">
                  Cupones habilitados para ser utilizados.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asignados a promotores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{assignedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Codigos con responsables de venta asignados.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promotores activos</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{promoterCount}</div>
                <p className="text-xs text-muted-foreground">
                  Usuarios con cupones asociados.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      {isPromoter && promoterCoupons.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aun no tenes cupones asignados. Pedile a un administrador que cree uno para vos.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">
                {isPromoter ? 'Mis cupones de venta' : 'Listado de cupones'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {isPromoter
                  ? 'Seguimiento detallado de cada codigo y su desempeno.'
                  : 'Administra codigos, descuentos y asignaciones.'}
              </p>
            </div>
            {isAdmin && (
              <Tabs defaultValue="all" className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="assigned" disabled>
                    Asignados
                  </TabsTrigger>
                  <TabsTrigger value="unassigned" disabled>
                    Sin asignar
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Codigo</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Promotor</TableHead>
                    <TableHead>Limite</TableHead>
                    <TableHead>Eventos</TableHead>
                    {isPromoter && <TableHead>Entradas</TableHead>}
                    {isPromoter && <TableHead>Ventas</TableHead>}
                    {isPromoter && <TableHead>Comision</TableHead>}
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[140px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(isPromoter ? promoterCoupons : coupons).map((coupon) => {
                    const metricsRow = findDashboardCoupon(dashboard ?? null, coupon.id);
                    const promoterName = coupon.promoter
                      ? `${coupon.promoter.firstName} ${coupon.promoter.lastName}`.trim() ||
                        coupon.promoter.email
                      : 'Sin asignar';

                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold tracking-wide">{coupon.code}</p>
                            <p className="text-xs text-muted-foreground">
                              {coupon.description || 'Sin descripcion'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="uppercase">
                              {coupon.type === 'FREE'
                                ? 'Gratis'
                                : coupon.type === 'AMOUNT'
                                ? 'Monto fijo'
                                : 'Porcentaje'}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {discountLabel({
                                type: coupon.type,
                                value: Number(coupon.value ?? 0),
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.promoter ? (
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-tight">
                                {promoterName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Comision {commissionLabel(coupon.commissionRate)}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="secondary">Disponible</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {limitLabel(coupon.maxRedemptions)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {coupon.allowedEvents && coupon.allowedEvents.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-sm">
                                {coupon.allowedEvents
                                  .slice(0, 2)
                                  .map((event) => event.title)
                                  .join(' • ')}
                              </p>
                              {coupon.allowedEvents.length > 2 && (
                                <p className="text-xs text-muted-foreground">
                                  +{coupon.allowedEvents.length - 2} eventos mas
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Todos los eventos</span>
                          )}
                        </TableCell>
                        {isPromoter && (
                          <TableCell>
                            <span className="text-sm">
                              {integerFormatter.format(metricsRow?.ticketsSold ?? 0)}
                            </span>
                          </TableCell>
                        )}
                        {isPromoter && (
                          <TableCell>
                            <span className="text-sm">
                              {currency.format(metricsRow?.netRevenue ?? 0)}
                            </span>
                          </TableCell>
                        )}
                        {isPromoter && (
                          <TableCell>
                            <span className="text-sm">
                              {currency.format(metricsRow?.commissionEarned ?? 0)}
                            </span>
                          </TableCell>
                        )}
                        <TableCell>
                          <Badge
                            variant={coupon.isActive ? 'outline' : 'secondary'}
                            className={`px-2 ${
                              coupon.isActive ? 'border-green-500 text-green-600' : ''
                            }`}
                          >
                            {coupon.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenMetrics(coupon)}
                              title="Ver metricas"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleOpenEdit(coupon)}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      title="Eliminar"
                                      disabled={deletingId === coupon.id}
                                    >
                                      {deletingId === coupon.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Eliminar cupon</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta accion es definitiva. Las ordenes existentes no se veran afectadas.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(coupon)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {coupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={isPromoter ? 10 : 7} className="text-center">
                        <div className="py-10 text-sm text-muted-foreground">
                          {isAdmin
                            ? 'No hay cupones creados todavia.'
                            : 'Todavia no hay cupones disponibles.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={formOpen} onOpenChange={handleDialogChange}>
        <DialogContent
          className="max-w-2xl overflow-hidden"
          style={{
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Nuevo cupon' : `Editar cupon ${formState.code}`}
            </DialogTitle>
            <DialogDescription>
              Configura descuentos, limites y comisiones para tus promotores.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-6 overflow-hidden"
            style={{
              maxHeight: '70vh',
            }}
          >
            <div
              className="flex-1 space-y-6 pr-1"
              style={{
                minHeight: 0,
                overflowY: 'auto',
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="coupon-code">Codigo</Label>
                <Input
                  id="coupon-code"
                  value={formState.code}
                  onChange={(event) =>
                    setFormState((prev) => ({
                      ...prev,
                      code: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="CASTILLO10"
                  required
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupon-type">Tipo de descuento</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value: CouponType) =>
                    setFormState((prev) => ({
                      ...prev,
                      type: value,
                      value: value === 'FREE' ? '' : prev.value || '10',
                    }))
                  }
                >
                  <SelectTrigger id="coupon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                    <SelectItem value="AMOUNT">Monto fijo</SelectItem>
                    <SelectItem value="FREE">Entradas sin cargo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formState.type !== 'FREE' && (
                <div className="space-y-2">
                  <Label htmlFor="coupon-value">
                    Valor ({formState.type === 'PERCENTAGE' ? '%' : 'ARS'})
                  </Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    min={0}
                    max={formState.type === 'PERCENTAGE' ? 100 : undefined}
                    step="0.01"
                    value={formState.value}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, value: event.target.value }))
                    }
                    placeholder={formState.type === 'PERCENTAGE' ? '10' : '1000'}
                  />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coupon-description">Descripcion interna</Label>
                <Textarea
                  id="coupon-description"
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, description: event.target.value }))
                  }
                  placeholder="Notas internas del cupon"
                  rows={3}
                />
              </div>
            </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="coupon-limit">Limite de ventas</Label>
                  <Switch
                    id="coupon-limit"
                    checked={formState.hasLimit}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => ({
                        ...prev,
                        hasLimit: checked,
                        maxRedemptions: checked ? prev.maxRedemptions : '',
                      }))
                    }
                  />
                </div>
                {formState.hasLimit ? (
                  <Input
                    type="number"
                    min={1}
                    value={formState.maxRedemptions}
                    onChange={(event) =>
                      setFormState((prev) => ({
                        ...prev,
                        maxRedemptions: event.target.value,
                      }))
                    }
                    placeholder="Cantidad maxima de tickets"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin limite: se podra usar indefinidamente.
                  </p>
                )}
              </div>
                <div className="space-y-3 rounded-md border p-4">
                <Label htmlFor="coupon-promoter">Asignar a promotor</Label>
                <Select
                  value={formState.promoterId}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      promoterId: value === 'none' ? '' : value,
                      commissionRate:
                        value === 'none' ? '' : prev.commissionRate || '10',
                    }))
                  }
                >
                  <SelectTrigger id="coupon-promoter">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {promoters.map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.firstName} {user.lastName} - {user.role.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formState.promoterId && (
                  <div className="space-y-2">
                    <Label htmlFor="coupon-commission">Comision (%)</Label>
                    <Input
                      id="coupon-commission"
                      type="number"
                      min={0}
                      max={100}
                      step="0.25"
                      value={formState.commissionRate}
                      onChange={(event) =>
                        setFormState((prev) => ({
                          ...prev,
                          commissionRate: event.target.value,
                        }))
                      }
                      placeholder="Ej: 15"
                    />
                    <p className="text-xs text-muted-foreground">
                      Se calcula sobre el monto final de la orden.
                    </p>
                  </div>
                )}
              </div>
                <div className="space-y-3 rounded-md border p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Eventos habilitados</Label>
                    <p className="text-xs text-muted-foreground">
                      Si no seleccionas eventos, el cupon se aplicara en todos los disponibles.
                    </p>
                  </div>
                  {formState.eventIds.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormState((prev) => ({ ...prev, eventIds: [] }))}
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {eventsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando eventos...</span>
                    </div>
                    ) : eventOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay eventos disponibles.</p>
                    ) : (
                    eventOptions.map((eventItem) => {
                      const checked = selectedEventIds.has(eventItem.id);
                      const dateLabel = eventItem.date
                        ? new Date(eventItem.date).toLocaleDateString('es-AR')
                        : 'Fecha a confirmar';
                      const statusLabel = eventItem.status ? String(eventItem.status).toLowerCase() : null;
                      const meta = [dateLabel, eventItem.time ? `${eventItem.time} hs` : null, statusLabel]
                        .filter(Boolean)
                        .join(' • ');
                      return (
                        <label key={eventItem.id} className="flex items-start gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4"
                            checked={checked}
                            onChange={(evt) => toggleEventSelection(eventItem.id, evt.target.checked)}
                          />
                          <span>
                            <span className="font-medium">{eventItem.title}</span>
                            <span className="block text-xs text-muted-foreground">{meta}</span>
                          </span>
                        </label>
                      );
                    })
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">Estado</p>
                  <p className="text-sm text-muted-foreground">
                    {formState.isActive
                      ? 'El cupon estara disponible inmediatamente.'
                      : 'El cupon quedara guardado pero deshabilitado.'}
                  </p>
                </div>
                <Switch
                  checked={formState.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : formMode === 'create' ? (
                  'Crear cupon'
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet
        open={metricsOpen}
        onOpenChange={(open) => {
          setMetricsOpen(open);
          if (!open) {
            setMetrics(null);
            setSelectedCoupon(null);
          }
        }}
      >
        <SheetContent className="w-full max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Metricas del cupon</SheetTitle>
            <SheetDescription>
              Rendimiento y resultados de <span className="font-semibold">{selectedCoupon?.code}</span>
            </SheetDescription>
          </SheetHeader>
          {selectedCoupon && (
            <div className="mt-4 space-y-1 text-sm">
              <p className="font-medium">Eventos habilitados</p>
              {selectedCoupon.allowedEvents && selectedCoupon.allowedEvents.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                  {selectedCoupon.allowedEvents.map((event) => (
                    <li key={event.id}>{event.title}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">Disponible para todos los eventos.</p>
              )}
            </div>
          )}
          <div className="mt-6 space-y-6">
            {metricsLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : metricsSummary ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                        Ventas netas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {currency.format(metricsSummary.netRevenue)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Despues de aplicar descuentos.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                        Entradas vendidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {integerFormatter.format(metricsSummary.ticketsSold)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Incluye ordenes aprobadas y pendientes.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                        Descuentos otorgados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {currency.format(metricsSummary.discountGiven)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total bonificado gracias al cupon.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
                        Comision generada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-semibold">
                        {currency.format(metricsSummary.commissionEarned)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Suma total asignada al promotor.
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ordenes</span>
                    <span className="font-medium">{metricsSummary.orders}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Limite disponible</span>
                    <span className="font-medium">
                      {limitLabel(metricsSummary.remainingQuota)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ultima orden</span>
                    <span className="font-medium">
                      {metricsSummary.lastOrderAt
                        ? new Date(metricsSummary.lastOrderAt).toLocaleString('es-AR')
                        : 'Sin registros'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Este cupon todavia no registra ventas aprobadas.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CouponsManager;

































