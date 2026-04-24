import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Search, 
  Filter, 
  Archive,
  Settings,
  Trash2,
  ExternalLink,
  Clock,
  AlertCircle,
  Info,
  CheckCircle
} from 'lucide-react';
import { Notification, getNotificationIcon, getNotificationColor, formatNotificationTime } from '../../data/notificationsData';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onAction?: (url?: string) => void;
  showActions?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ 
  notification, 
  onMarkAsRead, 
  onAction,
  showActions = true 
}) => {
  const handleAction = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
    }
  };

  const priorityColors = {
    low: 'border-l-gray-400',
    medium: 'border-l-blue-500',
    high: 'border-l-red-500'
  };

  const priorityIcons = {
    low: <Info className="h-4 w-4 text-gray-400" />,
    medium: <AlertCircle className="h-4 w-4 text-blue-500" />,
    high: <AlertCircle className="h-4 w-4 text-red-500" />
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md border-l-4 ${
        priorityColors[notification.priority]
      } ${!notification.isRead ? 'bg-accent/20' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-xl">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className={`text-base ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}>
                  {notification.title}
                </CardTitle>
                {priorityIcons[notification.priority]}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatNotificationTime(notification.createdAt)}</span>
                <Badge variant="outline" className="text-xs py-0">
                  {notification.type}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            {showActions && (
              <div className="flex gap-1">
                {!notification.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-8 w-8 p-0"
                    title="Marcar como leída"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {notification.actionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAction}
                    className="h-8 w-8 p-0"
                    title="Ver más"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm leading-relaxed">
          {notification.message}
        </CardDescription>
        
        {notification.actionUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction}
            className="mt-3 h-8 px-0 text-blue-500 hover:text-blue-600"
          >
            Ver detalles <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const Notificaciones: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, currentRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
  const readNotifications = filteredNotifications.filter(n => n.isRead);

  const notificationTypes = Array.from(new Set(notifications.map(n => n.type)));
  const priorities = ['low', 'medium', 'high'];

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    byType: notificationTypes.reduce((acc, type) => ({
      ...acc,
      [type]: notifications.filter(n => n.type === type).length
    }), {} as Record<string, number>),
    byPriority: priorities.reduce((acc, priority) => ({
      ...acc,
      [priority]: notifications.filter(n => n.priority === priority).length
    }), {} as Record<string, number>)
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notificaciones</h1>
            <p className="text-muted-foreground mt-1">
              Centro de notificaciones para {currentRole}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sin leer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{stats.unread}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Alta prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.byPriority.high}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Media prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.byPriority.medium}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {notificationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {getNotificationIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Todas ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Sin leer ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Leídas ({readNotifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No se encontraron resultados para tu búsqueda.' : 'Todas las notificaciones aparecerán aquí.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="unread" className="mt-6">
            <div className="space-y-4">
              {unreadNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-semibold mb-2">¡Excelente!</h3>
                    <p className="text-muted-foreground">
                      No tienes notificaciones sin leer.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="read" className="mt-6">
            <div className="space-y-4">
              {readNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Sin notificaciones leídas</h3>
                    <p className="text-muted-foreground">
                      Las notificaciones que marques como leídas aparecerán aquí.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    showActions={false}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};