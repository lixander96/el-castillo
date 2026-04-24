import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Key, 
  Globe, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const SeguridadPrivacidad: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    emailVisible: false,
    phoneVisible: false,
    marketingEmails: true,
    dataAnalytics: true,
    locationTracking: false,
    cookiesAccepted: true,
    twoFactorAuth: false
  });

  const [securityLogs] = useState([
    {
      id: 1,
      action: 'Inicio de sesión',
      location: 'Buenos Aires, Argentina',
      device: 'Chrome en Windows',
      timestamp: '2024-01-15 14:30:22',
      status: 'success'
    },
    {
      id: 2,
      action: 'Cambio de contraseña',
      location: 'Buenos Aires, Argentina',
      device: 'Chrome en Windows',
      timestamp: '2024-01-14 09:15:10',
      status: 'success'
    },
    {
      id: 3,
      action: 'Intento de acceso fallido',
      location: 'Ubicación desconocida',
      device: 'Bot/Crawler',
      timestamp: '2024-01-13 22:45:33',
      status: 'blocked'
    }
  ]);

  const [dataExports] = useState([
    {
      id: 1,
      type: 'Datos personales',
      format: 'JSON',
      size: '2.4 MB',
      requested: '2024-01-10',
      status: 'completed'
    },
    {
      id: 2,
      type: 'Historial de eventos',
      format: 'CSV',
      size: '856 KB',
      requested: '2024-01-08',
      status: 'processing'
    }
  ]);

  const handlePrivacyToggle = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success('Configuración de privacidad actualizada');
  };

  const handleDataExport = (type: string) => {
    toast.success(`Exportación de ${type} iniciada. Recibirás un email cuando esté lista.`);
  };

  const handleAccountDeletion = () => {
    toast.error('Funcionalidad de demo. En producción, esto iniciaría el proceso de eliminación de cuenta.');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Seguridad y Privacidad
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu privacidad y seguridad en El Castillo Barracas
          </p>
        </div>
        
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          Demo — Configuraciones simuladas
        </Badge>
      </div>

      <Tabs defaultValue="privacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="data">Mis Datos</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
        </TabsList>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Visibilidad del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Perfil público</p>
                  <p className="text-sm text-muted-foreground">
                    Permite que otros usuarios vean tu perfil básico
                  </p>
                </div>
                <Switch
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) => handlePrivacyToggle('profileVisible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email visible</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra tu email en tu perfil público
                  </p>
                </div>
                <Switch
                  checked={privacySettings.emailVisible}
                  onCheckedChange={(checked) => handlePrivacyToggle('emailVisible', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Teléfono visible</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra tu teléfono para contacto directo
                  </p>
                </div>
                <Switch
                  checked={privacySettings.phoneVisible}
                  onCheckedChange={(checked) => handlePrivacyToggle('phoneVisible', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Comunicaciones y Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emails de marketing</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe información sobre eventos y promociones
                  </p>
                </div>
                <Switch
                  checked={privacySettings.marketingEmails}
                  onCheckedChange={(checked) => handlePrivacyToggle('marketingEmails', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics y mejoras</p>
                  <p className="text-sm text-muted-foreground">
                    Ayúdanos a mejorar la plataforma con datos anónimos
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataAnalytics}
                  onCheckedChange={(checked) => handlePrivacyToggle('dataAnalytics', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Geolocalización</p>
                  <p className="text-sm text-muted-foreground">
                    Permite el uso de tu ubicación para recomendar eventos cercanos
                  </p>
                </div>
                <Switch
                  checked={privacySettings.locationTracking}
                  onCheckedChange={(checked) => handlePrivacyToggle('locationTracking', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Autenticación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de dos factores</p>
                  <p className="text-sm text-muted-foreground">
                    Agrega una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={privacySettings.twoFactorAuth}
                    onCheckedChange={(checked) => handlePrivacyToggle('twoFactorAuth', checked)}
                  />
                  {privacySettings.twoFactorAuth && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cambiar contraseña</p>
                  <p className="text-sm text-muted-foreground">
                    Actualiza tu contraseña regularmente
                  </p>
                </div>
                <Button variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Cambiar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.device} • {log.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      <Badge 
                        variant={log.status === 'success' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {log.status === 'success' ? 'Exitoso' : 'Bloqueado'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Exportar Mis Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Solicita una copia de todos tus datos almacenados en nuestra plataforma.
              </p>

              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Datos personales</p>
                    <p className="text-xs text-muted-foreground">
                      Perfil, preferencias y configuraciones
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataExport('datos personales')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Historial de eventos</p>
                    <p className="text-xs text-muted-foreground">
                      Tickets comprados y eventos asistidos
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataExport('historial de eventos')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Datos de interacción</p>
                    <p className="text-xs text-muted-foreground">
                      Analytics y métricas de uso (anónimos)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataExport('datos de interacción')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Exportaciones Solicitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataExports.map((export_item) => (
                  <div key={export_item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{export_item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {export_item.format} • {export_item.size} • Solicitado el {export_item.requested}
                      </p>
                    </div>
                    <Badge 
                      variant={export_item.status === 'completed' ? 'secondary' : 'outline'}
                    >
                      {export_item.status === 'completed' ? 'Completado' : 'Procesando'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Zona Peligrosa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Eliminar cuenta:</strong> Esta acción es permanente e irreversible. 
                  Todos tus datos serán eliminados después de 30 días.
                </AlertDescription>
              </Alert>
              
              <Button 
                variant="destructive" 
                onClick={handleAccountDeletion}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar mi cuenta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Normativas y Cumplimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">GDPR (Reglamento General de Protección de Datos)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cumplimos con las normativas europeas de protección de datos.
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cumplimiento verificado</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Ley de Protección de Datos Personales (Argentina)</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Adherimos a la Ley 25.326 de Protección de Datos Personales.
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cumplimiento verificado</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Cookies y Tecnologías de Seguimiento</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Utilizamos cookies esenciales y analíticas con tu consentimiento.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Configurado</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Gestionar cookies
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacto de Privacidad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  Para consultas sobre privacidad y protección de datos:
                </p>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Email:</strong> privacidad@elcastillobarracas.com<br />
                    <strong>Teléfono:</strong> +54 11 1234-5678<br />
                    <strong>Dirección:</strong> Av. Barracas 123, CABA, Argentina
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Responderemos a tu consulta dentro de 72 horas hábiles.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};