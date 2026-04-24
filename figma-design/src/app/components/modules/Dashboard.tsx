import React, { useState } from 'react';
import { mockDashboardData } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  ShoppingCart,
  Utensils,
  Play,
  XCircle,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend = 'neutral' }) => {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : BarChart3;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-xs ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {change > 0 ? '+' : ''}{change}% vs. mes anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { currentRole } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drillDownData, setDrillDownData] = useState<any>(null);

  const isAuthorized = ['admin', 'operaciones'].includes(currentRole);

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Acceso restringido</h3>
          <p className="text-muted-foreground">
            Solo los administradores y el equipo de operaciones pueden acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  const handleDrillDown = (metric: string) => {
    setSelectedMetric(metric);
    
    // Simulate fetching detailed data based on metric
    const mockDetailData = {
      'traffic': {
        title: 'Análisis Detallado de Tráfico',
        data: [
          { hour: '00:00', visitors: 45, pages: 120 },
          { hour: '06:00', visitors: 89, pages: 234 },
          { hour: '12:00', visitors: 156, pages: 423 },
          { hour: '18:00', visitors: 234, pages: 567 },
          { hour: '23:00', visitors: 123, pages: 345 }
        ]
      },
      'revenue': {
        title: 'Desglose de Ingresos',
        data: [
          { category: 'Tickets VIP', amount: 45000, percentage: 35 },
          { category: 'Tickets Standard', amount: 32000, percentage: 25 },
          { category: 'Reservas Premium', amount: 28000, percentage: 22 },
          { category: 'Marketplace', amount: 23000, percentage: 18 }
        ]
      },
      'upcoming-events': {
        title: 'Eventos Próximos - Análisis',
        data: [
          { event: 'Jazz Night', date: '2025-10-15', tickets: 120, capacity: 150, revenue: 85000 },
          { event: 'Art Exhibition', date: '2025-10-20', tickets: 80, capacity: 80, revenue: 45000 },
          { event: 'Workshop', date: '2025-10-25', tickets: 12, capacity: 20, revenue: 18000 }
        ]
      }
    };
    
    setDrillDownData(mockDetailData[metric as keyof typeof mockDetailData] || null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Dashboard Analítico</h1>
          <p className="text-muted-foreground">
            Métricas y análisis de rendimiento de El Castillo Barracas
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="events">Eventos</SelectItem>
              <SelectItem value="reservations">Reservas</SelectItem>
              <SelectItem value="marketplace">Marketplace</SelectItem>
              <SelectItem value="streaming">Streaming</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diario</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Tráfico Diario"
              value={mockDashboardData.dailyTraffic.toLocaleString()}
              change={12}
              trend="up"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Tickets Vendidos"
              value={mockDashboardData.ticketsSold}
              change={8}
              trend="up"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Reservas Confirmadas"
              value={mockDashboardData.reservationsConfirmed}
              change={-3}
              trend="down"
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Ingresos Diarios"
              value={`$${(mockDashboardData.dailyRevenue / 1000).toFixed(0)}K`}
              change={15}
              trend="up"
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Tráfico Mensual
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDrillDown('traffic')}
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={mockDashboardData.monthlyTraffic}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Ingresos por Categoría
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDrillDown('revenue')}
                  >
                    <PieChart className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={mockDashboardData.revenueByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {mockDashboardData.revenueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Cancelaciones"
              value={mockDashboardData.cancelledReservations}
              change={-25}
              trend="up"
              icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Obras Vendidas"
              value={mockDashboardData.artworksSold}
              change={35}
              trend="up"
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Consumo Gastronómico"
              value={`$${(mockDashboardData.foodConsumption / 1000).toFixed(0)}K`}
              change={18}
              trend="up"
              icon={<Utensils className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricCard
              title="Engagement Streaming"
              value={`${mockDashboardData.streamingEngagement}%`}
              change={5}
              trend="up"
              icon={<Play className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Eventos por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500 text-white">Próximos</Badge>
                      <span>18 eventos</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDrillDown('upcoming-events')}>
                      Ver detalle
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500 text-white">Agotados</Badge>
                      <span>5 eventos</span>
                    </div>
                    <Button variant="ghost" size="sm">Ver detalle</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500 text-white">En curso</Badge>
                      <span>2 eventos</span>
                    </div>
                    <Button variant="ghost" size="sm">Ver detalle</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ventas por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Música', sales: 450, percentage: 45 },
                    { category: 'Arte', sales: 320, percentage: 32 },
                    { category: 'Talleres', sales: 230, percentage: 23 }
                  ].map(item => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.category}</span>
                        <span>{item.sales} tickets</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Pendientes</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Confirmadas</span>
                    <Badge className="bg-green-500 text-white">24</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rechazadas</span>
                    <Badge variant="destructive">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Espacios Más Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Sala Principal</span>
                    <span className="font-medium">15 reservas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Galería Norte</span>
                    <span className="font-medium">9 reservas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taller Creativo</span>
                    <span className="font-medium">6 reservas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Reservas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    $2.4M
                  </div>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-green-600 mt-2">
                    <TrendingUp className="h-3 w-3" />
                    +22% vs. mes anterior
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ventas de Obras</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={[
                    { month: 'Ene', sales: 12 },
                    { month: 'Feb', sales: 19 },
                    { month: 'Mar', sales: 15 },
                    { month: 'Abr', sales: 28 },
                    { month: 'May', sales: 22 },
                    { month: 'Jun', sales: 31 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Artistas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Ana Martínez', sales: 8, revenue: 145000 },
                    { name: 'Roberto Silva', sales: 5, revenue: 98000 },
                    { name: 'Carmen López', sales: 4, revenue: 87000 }
                  ].map((artist, index) => (
                    <div key={artist.name} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{artist.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {artist.sales} obras vendidas
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${(artist.revenue / 1000).toFixed(0)}K
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Streaming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Streams activos</span>
                  <Badge className="bg-red-500 text-white">3 LIVE</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Viewers promedio</span>
                  <span className="font-medium">245</span>
                </div>
                <div className="flex justify-between">
                  <span>Tiempo promedio</span>
                  <span className="font-medium">28 min</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement rate</span>
                  <span className="font-medium text-green-600">68%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Streams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Proceso Creativo</h4>
                    <p className="text-sm text-muted-foreground">Hoy 20:00</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Taller de Pintura</h4>
                    <p className="text-sm text-muted-foreground">Mañana 15:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ingresos por Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">$45.2K</div>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                  <div className="mt-2 text-sm">
                    <span className="text-green-600">Premium: $32K</span><br />
                    <span className="text-blue-600">Donaciones: $13.2K</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Drill-down Detail View */}
      {selectedMetric && drillDownData && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {drillDownData.title}
              <Button variant="ghost" onClick={() => setSelectedMetric(null)}>
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMetric === 'traffic' && (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={drillDownData.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="visitors" stroke="#8884d8" name="Visitantes" />
                    <Line type="monotone" dataKey="pages" stroke="#82ca9d" name="Páginas vistas" />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="font-bold text-lg">1,247</div>
                    <div className="text-sm text-muted-foreground">Visitantes únicos</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="font-bold text-lg">3,456</div>
                    <div className="text-sm text-muted-foreground">Páginas vistas</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <div className="font-bold text-lg">2.8</div>
                    <div className="text-sm text-muted-foreground">Páginas por sesión</div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'revenue' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBarChart data={drillDownData.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Ingresos']} />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Desglose detallado</h4>
                    <div className="space-y-3">
                      {drillDownData.data.map((item: any, index: number) => (
                        <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{item.category}</div>
                            <div className="text-sm text-muted-foreground">{item.percentage}% del total</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${item.amount.toLocaleString()}</div>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedMetric === 'upcoming-events' && (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Evento</th>
                        <th className="text-left p-3">Fecha</th>
                        <th className="text-left p-3">Tickets Vendidos</th>
                        <th className="text-left p-3">Capacidad</th>
                        <th className="text-left p-3">% Ocupación</th>
                        <th className="text-left p-3">Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drillDownData.data.map((event: any) => (
                        <tr key={event.event} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{event.event}</td>
                          <td className="p-3">{new Date(event.date).toLocaleDateString('es-AR')}</td>
                          <td className="p-3">{event.tickets}</td>
                          <td className="p-3">{event.capacity}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${(event.tickets / event.capacity) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm">{Math.round((event.tickets / event.capacity) * 100)}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-medium">${event.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};