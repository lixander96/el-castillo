import React, { useState, useEffect } from 'react';
import { mockStreams } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Play, 
  Users, 
  Calendar, 
  Bell, 
  Video, 
  Maximize, 
  Volume2, 
  Settings, 
  Clock,
  BellRing,
  Eye,
  MessageCircle,
  Heart,
  Share,
  Pause,
  Maximize2
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface StreamReminder {
  streamId: string;
  streamTitle: string;
  scheduledTime: Date;
  reminderTime: number; // minutes before
  enabled: boolean;
}

export const Streaming: React.FC = () => {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState('live');
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reminders, setReminders] = useState<StreamReminder[]>([]);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState('10');
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  const isAuthorized = ['visitante', 'artista', 'admin'].includes(currentRole);

  // Simulate live stream data
  const liveStream = {
    id: 'live-1',
    title: 'Taller de Pintura Experimental',
    artist: 'Ana Martínez',
    viewers: 245,
    startedAt: new Date(Date.now() - 23 * 60 * 1000), // Started 23 minutes ago
    thumbnail: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=450&fit=crop',
    description: 'Observa técnicas avanzadas de pintura con materiales no convencionales',
    accessType: 'free' as const
  };

  useEffect(() => {
    // Check for upcoming streams and send notifications
    const checkReminders = () => {
      const now = new Date();
      reminders.forEach(reminder => {
        const timeDiff = reminder.scheduledTime.getTime() - now.getTime();
        const minutesDiff = Math.floor(timeDiff / (1000 * 60));
        
        if (minutesDiff === reminder.reminderTime && reminder.enabled) {
          toast.info(
            `🔴 Recordatorio: "${reminder.streamTitle}" comenzará en ${reminder.reminderTime} minutos`,
            {
              duration: 8000,
              action: {
                label: 'Ver Stream',
                onClick: () => handleWatchStream(reminder.streamId)
              }
            }
          );
        }
      });
    };

    // Simulate immediate notification for demo
    const timer = setTimeout(() => {
      toast.info('🔴 Recordatorio: "Proceso Creativo en Vivo" comenzará en 10 minutos', {
        duration: 8000,
        action: {
          label: 'Ver Stream',
          onClick: () => setActiveTab('live')
        }
      });
    }, 3000);

    const interval = setInterval(checkReminders, 60000); // Check every minute

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [reminders]);

  const handleWatchStream = (streamId: string) => {
    const stream = mockStreams.find(s => s.id === streamId) || liveStream;
    setSelectedStream(stream);
    setCurrentStreamId(streamId);
    setActiveTab('live');
    setIsPlaying(true);
    toast.success('Conectando al stream...');
  };

  const handleSetReminder = (stream: any) => {
    const newReminder: StreamReminder = {
      streamId: stream.id,
      streamTitle: stream.title,
      scheduledTime: new Date(stream.scheduledAt),
      reminderTime: parseInt(reminderMinutes),
      enabled: true
    };
    
    setReminders(prev => [...prev.filter(r => r.streamId !== stream.id), newReminder]);
    setShowReminderDialog(false);
    toast.success(`Recordatorio configurado: ${reminderMinutes} minutos antes del stream`);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast.info(isPlaying ? 'Stream pausado' : 'Reproduciendo stream');
  };

  // Embedded Video Player Component
  const VideoPlayer = ({ stream }: { stream: any }) => (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div className="aspect-video relative">
        {/* Placeholder for embedded video */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">{stream.title}</p>
            <p className="text-sm opacity-75">Player embebido - {stream.artist}</p>
            {stream.id === 'live-1' && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-medium">EN VIVO</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex items-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              onClick={togglePlayPause}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlayPause}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Volume2 className="h-4 w-4" />
              <span className="text-sm">100%</span>
            </div>
            
            <div className="flex items-center gap-3">
              {stream.viewers && (
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  {stream.viewers.toLocaleString()}
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info Bar */}
      <div className="p-4 bg-gray-900 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">{stream.title}</h3>
            <p className="text-sm text-gray-300">por {stream.artist}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/20">
              <Heart className="h-4 w-4 mr-1" />
              Me gusta
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:text-white hover:bg-white/20">
              <Share className="h-4 w-4 mr-1" />
              Compartir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Acceso restringido</h3>
          <p className="text-muted-foreground">
            Solo los visitantes, artistas y administradores pueden acceder al streaming.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1>Streaming en Vivo</h1>
        <p className="text-muted-foreground">
          Disfruta de contenido exclusivo y eventos en tiempo real
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="live">En Vivo</TabsTrigger>
          <TabsTrigger value="schedule">Agenda</TabsTrigger>
          <TabsTrigger value="reminders">Mis Recordatorios</TabsTrigger>
          {currentRole === 'artista' && <TabsTrigger value="artist">Panel Artista</TabsTrigger>}
        </TabsList>

        <TabsContent value="live" className="space-y-6">
          {/* Live Stream Player */}
          {selectedStream || liveStream ? (
            <Card>
              <CardContent className="p-0">
                <VideoPlayer stream={selectedStream || liveStream} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No hay streams activos</h3>
                <p className="text-muted-foreground">
                  Revisa la agenda para ver próximos eventos
                </p>
              </CardContent>
            </Card>
          )}

          {/* Live Chat Simulation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat en Vivo
                <Badge className="bg-green-500 text-white">
                  {Math.floor(Math.random() * 50) + 20} conectados
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-48 overflow-y-auto bg-muted/50 p-3 rounded-lg">
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-blue-600">María_Art:</span>
                  <span>¡Increíble técnica! 🎨</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-green-600">CarlosP:</span>
                  <span>¿Qué tipo de pincel estás usando?</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-purple-600">Ana_Martinez:</span>
                  <span>Es un pincel sintético, lo explico en el próximo segmento</span>
                </div>
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-red-600">Laura123:</span>
                  <span>Gracias por estos tutoriales! ❤️</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💬 <strong>Chat Demo:</strong> En una implementación real, aquí habría un chat interactivo en tiempo real
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStreams.map(stream => (
              <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <ImageWithFallback
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary"
                      onClick={() => handleWatchStream(stream.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Previsualizar
                    </Button>
                  </div>
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      stream.accessType === 'free' ? 'bg-green-500' : 'bg-amber-500'
                    } text-white`}
                  >
                    {stream.accessType === 'free' ? 'Gratis' : 'Premium'}
                  </Badge>
                  
                  {/* Countdown Timer */}
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {Math.floor((new Date(stream.scheduledAt).getTime() - Date.now()) / (1000 * 60 * 60))}h restantes
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-1">{stream.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stream.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(stream.scheduledAt).toLocaleDateString('es-AR')} - {' '}
                      {new Date(stream.scheduledAt).toLocaleTimeString('es-AR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleWatchStream(stream.id)}
                      disabled={stream.accessType === 'premium' && currentRole === 'visitante'}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      {stream.accessType === 'premium' && currentRole === 'visitante' 
                        ? 'Requiere Premium'
                        : 'Ver Stream'
                      }
                    </Button>
                    
                    <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedStream(stream)}
                        >
                          <Bell className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Configurar Recordatorio</DialogTitle>
                          <DialogDescription>
                            Configura notificaciones para no perderte este stream
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">{selectedStream?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {selectedStream && new Date(selectedStream.scheduledAt).toLocaleDateString('es-AR')} - {' '}
                              {selectedStream && new Date(selectedStream.scheduledAt).toLocaleTimeString('es-AR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="reminderTime">Recordarme</Label>
                            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutos antes</SelectItem>
                                <SelectItem value="10">10 minutos antes</SelectItem>
                                <SelectItem value="15">15 minutos antes</SelectItem>
                                <SelectItem value="30">30 minutos antes</SelectItem>
                                <SelectItem value="60">1 hora antes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => setShowReminderDialog(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              onClick={() => selectedStream && handleSetReminder(selectedStream)}
                              className="flex-1"
                            >
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Mis Recordatorios Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No tienes recordatorios</h3>
                  <p className="text-muted-foreground">
                    Configura recordatorios desde la agenda de streams
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(reminder => (
                    <div key={reminder.streamId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{reminder.streamTitle}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {reminder.scheduledTime.toLocaleDateString('es-AR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reminder.scheduledTime.toLocaleTimeString('es-AR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bell className="h-3 w-3" />
                            {reminder.reminderTime} min antes
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={reminder.enabled}
                          onCheckedChange={(checked) => {
                            setReminders(prev => prev.map(r => 
                              r.streamId === reminder.streamId 
                                ? { ...r, enabled: checked }
                                : r
                            ));
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReminders(prev => prev.filter(r => r.streamId !== reminder.streamId));
                            toast.success('Recordatorio eliminado');
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {currentRole === 'artista' && (
          <TabsContent value="artist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panel de Artista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Próximo Stream</h3>
                    <p className="text-sm text-muted-foreground">
                      "Proceso Creativo en Vivo" - Hoy 20:00
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      <Video className="h-4 w-4 mr-2" />
                      Iniciar Stream
                    </Button>
                    <Button variant="outline">
                      Programar Nuevo
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Estadísticas</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">Streams</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">1.2K</div>
                        <div className="text-sm text-muted-foreground">Viewers</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">28min</div>
                        <div className="text-sm text-muted-foreground">Promedio</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Integraciones Técnicas (Demo)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>YouTube Live:</strong> Para streams públicos y gratuitos</p>
            <p>• <strong>Vimeo Live:</strong> Para contenido premium y privado</p>
            <p>• <strong>Mux:</strong> Para streams optimizados y baja latencia</p>
            <p>• <strong>Notificaciones Push:</strong> Sistema de recordatorios automáticos</p>
            <p>• <strong>Chat en tiempo real:</strong> Integración con WebSocket para interacción</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};