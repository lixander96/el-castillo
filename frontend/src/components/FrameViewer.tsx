import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  Calendar, 
  Users, 
  Gavel, 
  Store, 
  UtensilsCrossed, 
  Tv, 
  BarChart3, 
  User, 
  Shield, 
  Building,
  FileText,
  Smartphone,
  Tablet,
  Monitor,
  Eye,
  Settings
} from 'lucide-react';

// Import all modules
import { Agenda } from './modules/Agenda';
import { Reservas } from './modules/Reservas';
import { Pujas } from './modules/Pujas';
import { Perfil } from './modules/Perfil';
import { Marketplace } from './modules/Marketplace';
import { Gastronomia } from './modules/Gastronomia';
import { Streaming } from './modules/Streaming';
import { Dashboard } from './modules/Dashboard';
import { Arquitectura } from './modules/Arquitectura';
import { SeguridadPrivacidad } from './modules/SeguridadPrivacidad';
import { README } from './modules/README';

// Frame definitions
export interface Frame {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'admin' | 'security' | 'docs';
  icon: React.ReactNode;
  component: React.ReactNode;
  breakpoints: ('mobile' | 'tablet' | 'desktop')[];
  roles: string[];
}

const frames: Frame[] = [
  {
    id: 'agenda',
    title: 'Agenda de Eventos',
    description: 'Vista principal de eventos, filtros y compra de tickets',
    category: 'core',
    icon: <Calendar className="h-4 w-4" />,
    component: <Agenda />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Visitante', 'Cliente', 'Artista', 'Operaciones', 'Admin']
  },
  {
    id: 'reservas',
    title: 'Reservas de Espacios',
    description: 'Wizard de reserva con calendario y configuración',
    category: 'core',
    icon: <Users className="h-4 w-4" />,
    component: <Reservas />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Cliente', 'Operaciones', 'Admin']
  },
  {
    id: 'pujas',
    title: 'Sistema de Pujas',
    description: 'Subastas de espacios y gestión de ofertas',
    category: 'core',
    icon: <Gavel className="h-4 w-4" />,
    component: <Pujas />,
    breakpoints: ['tablet', 'desktop'],
    roles: ['Cliente', 'Operaciones', 'Admin']
  },
  {
    id: 'marketplace',
    title: 'Marketplace de Artistas',
    description: 'Catálogo de artistas, portfolios y contrataciones',
    category: 'core',
    icon: <Store className="h-4 w-4" />,
    component: <Marketplace />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Visitante', 'Cliente', 'Artista', 'Operaciones', 'Admin']
  },
  {
    id: 'gastronomia',
    title: 'Gastronomía',
    description: 'Menú digital, pedidos y gestión gastronómica',
    category: 'core',
    icon: <UtensilsCrossed className="h-4 w-4" />,
    component: <Gastronomia />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Visitante', 'Cliente', 'Operaciones', 'Admin']
  },
  {
    id: 'streaming',
    title: 'Streaming en Vivo',
    description: 'Transmisiones en vivo y gestión de contenido',
    category: 'core',
    icon: <Tv className="h-4 w-4" />,
    component: <Streaming />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Visitante', 'Cliente', 'Operaciones', 'Admin']
  },
  {
    id: 'perfil',
    title: 'Perfil de Usuario',
    description: 'Gestión de perfil, tickets y preferencias',
    category: 'core',
    icon: <User className="h-4 w-4" />,
    component: <Perfil />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Cliente', 'Artista', 'Operaciones', 'Admin']
  },
  {
    id: 'dashboard',
    title: 'Panel de Dueños',
    description: 'KPIs, analítica y gestión administrativa',
    category: 'admin',
    icon: <BarChart3 className="h-4 w-4" />,
    component: <Dashboard />,
    breakpoints: ['tablet', 'desktop'],
    roles: ['Admin']
  },
  {
    id: 'seguridad',
    title: 'Seguridad & Privacidad',
    description: 'Configuraciones GDPR y gestión de privacidad',
    category: 'security',
    icon: <Shield className="h-4 w-4" />,
    component: <SeguridadPrivacidad />,
    breakpoints: ['mobile', 'tablet', 'desktop'],
    roles: ['Cliente', 'Artista', 'Operaciones', 'Admin']
  },
  {
    id: 'arquitectura',
    title: 'Arquitectura del Sistema',
    description: 'Documentación técnica y mock de arquitectura',
    category: 'docs',
    icon: <Building className="h-4 w-4" />,
    component: <Arquitectura />,
    breakpoints: ['desktop'],
    roles: ['Admin', 'Desarrollador']
  },
  {
    id: 'readme',
    title: 'README - Handoff',
    description: 'Documentación técnica completa y guía de handoff',
    category: 'docs',
    icon: <FileText className="h-4 w-4" />,
    component: <README />,
    breakpoints: ['desktop'],
    roles: ['Admin', 'Desarrollador']
  }
];

const breakpointSizes = {
  mobile: { width: '375px', height: '812px' },
  tablet: { width: '768px', height: '1024px' },
  desktop: { width: '1440px', height: '900px' }
};

const categoryColors = {
  core: 'bg-blue-500',
  admin: 'bg-purple-500',
  security: 'bg-green-500',
  docs: 'bg-orange-500'
};

export const FrameViewer: React.FC = () => {
  const [selectedFrame, setSelectedFrame] = useState<Frame>(frames[0]);
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredFrames = frames.filter(frame => 
    filterCategory === 'all' || frame.category === filterCategory
  );

  const currentSize = breakpointSizes[selectedBreakpoint];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold">ElCastilloBarracas - Frame Viewer</h1>
              <p className="text-muted-foreground">
                Documentación visual y handoff de componentes
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Demo — Datos falsos
              </Badge>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="core">Core Features</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="security">Seguridad</SelectItem>
                  <SelectItem value="docs">Documentación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Frames Disponibles</h3>
                <div className="space-y-2">
                  {filteredFrames.map((frame) => (
                    <Card 
                      key={frame.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedFrame.id === frame.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedFrame(frame)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <div className="mt-1">
                            {frame.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm truncate">{frame.title}</h4>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${categoryColors[frame.category]} text-white`}
                              >
                                {frame.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight">
                              {frame.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {frame.roles.slice(0, 3).map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                              {frame.roles.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{frame.roles.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Frame Controls */}
          <div className="border-b bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  {selectedFrame.icon}
                  {selectedFrame.title}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedFrame.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Breakpoint:</span>
                {selectedFrame.breakpoints.map((bp) => (
                  <Button
                    key={bp}
                    variant={selectedBreakpoint === bp ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedBreakpoint(bp)}
                    className="h-8"
                  >
                    {bp === 'mobile' && <Smartphone className="h-3 w-3 mr-1" />}
                    {bp === 'tablet' && <Tablet className="h-3 w-3 mr-1" />}
                    {bp === 'desktop' && <Monitor className="h-3 w-3 mr-1" />}
                    {bp}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="text-xs text-muted-foreground">
                Resolución: {currentSize.width} × {currentSize.height}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="text-xs text-muted-foreground">
                Roles: {selectedFrame.roles.join(', ')}
              </div>
            </div>
          </div>

          {/* Frame Preview */}
          <div className="flex-1 bg-muted/30 p-4 overflow-auto">
            <div className="flex justify-center">
              <div 
                className="bg-background border rounded-lg shadow-lg overflow-hidden"
                style={{
                  width: currentSize.width,
                  height: currentSize.height,
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <div className="h-full overflow-auto">
                  {selectedFrame.component}
                </div>
              </div>
            </div>
          </div>

          {/* Frame Info */}
          <div className="border-t bg-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Categoría:</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-2 ${categoryColors[selectedFrame.category]} text-white`}
                >
                  {selectedFrame.category}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Breakpoints soportados:</span>
                <span className="ml-2">{selectedFrame.breakpoints.join(', ')}</span>
              </div>
              <div>
                <span className="font-medium">Total de frames:</span>
                <span className="ml-2">{frames.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};