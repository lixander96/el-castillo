import React, { useEffect, useMemo, useState } from 'react';
import {
  AnalyticsEventOption,
  AnalyticsOverview,
  AnalyticsRange,
  DailySalesRow,
  PromoterBreakdownRow,
  fetchAnalyticsDailySales,
  fetchAnalyticsEventOptions,
  fetchAnalyticsOverview,
  fetchAnalyticsPromoters,
} from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts@2.15.2';
import {
  CalendarRange,
  CircleDollarSign,
  Loader2,
  Percent,
  Receipt,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';

const PRESETS = [
  { id: 'today', label: 'Hoy' },
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Último mes' },
  { id: '90d', label: 'Últimos 90 días' },
  { id: 'all', label: 'Todo el histórico' },
] as const;
type PresetId = (typeof PRESETS)[number]['id'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('es-AR').format(value);

const buildRange = (preset: PresetId): AnalyticsRange => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { from: from.toISOString(), to: to.toISOString() };
    case '7d':
      from.setDate(from.getDate() - 6);
      return { from: from.toISOString(), to: to.toISOString() };
    case '30d':
      from.setDate(from.getDate() - 29);
      return { from: from.toISOString(), to: to.toISOString() };
    case '90d':
      from.setDate(from.getDate() - 89);
      return { from: from.toISOString(), to: to.toISOString() };
    case 'all':
    default:
      return {};
  }
};

const formatDayLabel = (day: string) => {
  if (!day) return '';
  const [y, m, d] = day.split('-');
  if (!y || !m || !d) return day;
  return `${d}/${m}`;
};

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-semibold">{value}</div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

const AnalyticsDashboard: React.FC = () => {
  const [preset, setPreset] = useState<PresetId>('30d');
  const [eventId, setEventId] = useState<string>('all');
  const [events, setEvents] = useState<AnalyticsEventOption[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [daily, setDaily] = useState<DailySalesRow[]>([]);
  const [promoters, setPromoters] = useState<PromoterBreakdownRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo<AnalyticsRange>(() => {
    const base = buildRange(preset);
    if (eventId !== 'all') base.eventId = eventId;
    return base;
  }, [preset, eventId]);

  useEffect(() => {
    let cancelled = false;
    fetchAnalyticsEventOptions()
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAnalyticsOverview(range),
      fetchAnalyticsDailySales(range),
      fetchAnalyticsPromoters(range),
    ])
      .then(([ov, ds, pr]) => {
        if (cancelled) return;
        setOverview(ov);
        setDaily(ds);
        setPromoters(pr);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err?.response?.data?.message ?? err?.message ?? 'No se pudieron cargar las métricas.';
        setError(Array.isArray(message) ? message.join(', ') : String(message));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const totalPromoterTickets = useMemo(
    () => promoters.reduce((sum, p) => sum + p.ticketsSold, 0),
    [promoters],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analíticas e informes</h2>
          <p className="text-sm text-muted-foreground">
            KPIs, evolución diaria de ventas y rendimiento por promotor.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={preset} onValueChange={(value) => setPreset(value as PresetId)}>
            <SelectTrigger className="w-full sm:w-44">
              <CalendarRange className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rango temporal" />
            </SelectTrigger>
            <SelectContent>
              {PRESETS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los eventos</SelectItem>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total recaudado"
          value={overview ? formatCurrency(overview.totalRevenue) : '—'}
          description={loading ? 'Cargando...' : `${overview?.ordersCount ?? 0} órdenes aprobadas`}
          icon={<CircleDollarSign className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Tickets vendidos"
          value={overview ? formatNumber(overview.ticketsSold) : '—'}
          description={loading ? 'Cargando...' : 'Web + manuales en el rango'}
          icon={<Ticket className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Ticket promedio"
          value={overview ? formatCurrency(overview.averageTicket) : '—'}
          description={loading ? 'Cargando...' : 'Por orden'}
          icon={<Receipt className="h-5 w-5 text-primary" />}
        />
        <KpiCard
          title="Ocupación"
          value={overview ? `${overview.occupancyPct.toFixed(1)}%` : '—'}
          description={
            overview
              ? `${formatNumber(overview.totalOccupied)} / ${formatNumber(overview.totalCapacity)} cupos`
              : ''
          }
          icon={<Percent className="h-5 w-5 text-primary" />}
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Evolución de ventas diarias
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tickets aprobados por día. Identificá picos tras lanzamientos o pautas.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando datos...
            </div>
          ) : daily.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No hay ventas registradas en el rango seleccionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="day"
                  tickFormatter={formatDayLabel}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => formatCurrency(Number(value))}
                />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === 'Ingresos') return formatCurrency(Number(value));
                    return formatNumber(Number(value));
                  }}
                  labelFormatter={(label: any) => formatDayLabel(String(label))}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ticketsSold"
                  name="Tickets"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Ingresos"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Rendimiento de promotores
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Tickets vendidos por código y comisión liquidable.
              </p>
            </div>
            {!loading && totalPromoterTickets > 0 && (
              <Badge variant="secondary">{totalPromoterTickets} tickets vía cupón</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando...
            </div>
          ) : promoters.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay órdenes con cupón en el rango seleccionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cupón</TableHead>
                    <TableHead>Promotor</TableHead>
                    <TableHead className="text-right">Órdenes</TableHead>
                    <TableHead className="text-right">Tickets</TableHead>
                    <TableHead className="text-right">Recaudado</TableHead>
                    <TableHead className="text-right">Descuento dado</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoters.map((row) => (
                    <TableRow key={row.couponId}>
                      <TableCell>
                        <div className="font-medium">{row.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.type === 'PERCENTAGE'
                            ? `${row.value}% off`
                            : row.type === 'FREE'
                              ? 'Cortesía'
                              : `$${row.value} off`}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.promoter ? (
                          <div>
                            <div className="font-medium">{row.promoter.name}</div>
                            <div className="text-xs text-muted-foreground">{row.promoter.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin promotor</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(row.ordersCount)}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.ticketsSold)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.netRevenue)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(row.discountGiven)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {row.commissionRate > 0 ? formatCurrency(row.commission) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
