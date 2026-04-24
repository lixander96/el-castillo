import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  FileText, 
  Code, 
  Palette, 
  Users, 
  Rocket, 
  Settings,
  Check,
  Clock,
  AlertCircle,
  Zap
} from 'lucide-react';

export const README: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: <FileText className="h-4 w-4" /> },
    { id: 'tokens', label: 'Design Tokens', icon: <Palette className="h-4 w-4" /> },
    { id: 'components', label: 'Componentes', icon: <Code className="h-4 w-4" /> },
    { id: 'mockdata', label: 'Mock Data', icon: <FileText className="h-4 w-4" /> },
    { id: 'prototype', label: 'Prototipado', icon: <Zap className="h-4 w-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <Check className="h-4 w-4" /> },
    { id: 'roles', label: 'Roles', icon: <Users className="h-4 w-4" /> },
    { id: 'deployment', label: 'Deployment', icon: <Rocket className="h-4 w-4" /> }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary text-primary-foreground rounded-lg">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">ElCastilloBarracas — README Handoff</h1>
            <p className="text-muted-foreground">Documentación técnica completa para handoff del proyecto</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            ✅ Demo Completo
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            🎨 Design System
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            📱 Responsive
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            🚀 Production Ready
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Navegación</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    variant={activeSection === section.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.icon}
                    {section.label}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Descripción del Proyecto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      <strong>ElCastilloBarracas</strong> es una aplicación web completa que centraliza la gestión 
                      de un espacio cultural multifuncional. Integra agenda de eventos, reservas de espacios, 
                      sistema de pujas, marketplace de artistas, gastronomía, streaming y panel administrativo.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">🎯 Objetivo</h3>
                        <p className="text-sm">Demo funcional completo con mock data para mostrar todas las capacidades del sistema.</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">👥 Usuario Target</h3>
                        <p className="text-sm">Espacios culturales, centros de eventos, galerías de arte y venues multifuncionales.</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">🔧 Estado</h3>
                        <p className="text-sm">Demo completo con todas las funcionalidades implementadas y datos de prueba.</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">📅 Entrega</h3>
                        <p className="text-sm">Enero 2024 - Listo para presentación y handoff técnico.</p>
                      </div>
                    </div>

                    <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                      <h3 className="font-semibold mb-2 text-primary">⚡ Stack Tecnológico</h3>
                      <p className="text-sm mb-3">React 18 + TypeScript + Tailwind CSS 4.0 + ShadCN/UI + Motion/React</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Frontend-only</Badge>
                        <Badge variant="outline">Mock Data</Badge>
                        <Badge variant="outline">Responsive</Badge>
                        <Badge variant="outline">Dark/Light Theme</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Características Principales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Sistema completo de roles con visibilidad condicional</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Design system cohesivo con tema claro/oscuro</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Responsive design en 3 breakpoints principales</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Mock data realista para demos completas</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>FAB especial para testing de roles en tiempo real</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Frame Viewer para documentación y testing</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Design Tokens Section */}
            {activeSection === 'tokens' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Design Tokens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Color Tokens */}
                    <div>
                      <h3 className="font-semibold mb-4">Tokens de Color</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Principales</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--primary</span>
                                <p className="text-xs text-muted-foreground">Color principal de marca</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-secondary rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--secondary</span>
                                <p className="text-xs text-muted-foreground">Color secundario</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-accent rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--accent</span>
                                <p className="text-xs text-muted-foreground">Color de énfasis</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Semánticos</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-destructive rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--destructive</span>
                                <p className="text-xs text-muted-foreground">Errores y alertas</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-muted rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--muted</span>
                                <p className="text-xs text-muted-foreground">Texto secundario</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-border rounded border"></div>
                              <div>
                                <span className="text-sm font-mono">--border</span>
                                <p className="text-xs text-muted-foreground">Líneas divisorias</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Typography Tokens */}
                    <div>
                      <h3 className="font-semibold mb-4">Tokens de Tipografía</h3>
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <h1 className="mb-1">Heading 1 - 2xl</h1>
                          <code className="text-xs text-muted-foreground">font-size: var(--text-2xl), font-weight: 500</code>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h2 className="mb-1">Heading 2 - xl</h2>
                          <code className="text-xs text-muted-foreground">font-size: var(--text-xl), font-weight: 500</code>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <h3 className="mb-1">Heading 3 - lg</h3>
                          <code className="text-xs text-muted-foreground">font-size: var(--text-lg), font-weight: 500</code>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="mb-1">Body Text - base</p>
                          <code className="text-xs text-muted-foreground">font-size: var(--text-base), font-weight: 400</code>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Spacing & Border Radius */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-4">Border Radius</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-sm border"></div>
                            <span className="text-sm font-mono">--radius-sm</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded border"></div>
                            <span className="text-sm font-mono">--radius-lg (0.625rem)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded-xl border"></div>
                            <span className="text-sm font-mono">--radius-xl</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-4">Breakpoints</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Mobile</span>
                            <span className="font-mono">375px</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tablet</span>
                            <span className="font-mono">768px</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Desktop</span>
                            <span className="font-mono">1440px</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Components Section */}            
            {activeSection === 'components' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Catálogo de Componentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* ShadCN Components */}
                    <div>
                      <h3 className="font-semibold mb-4">Componentes UI Base (ShadCN)</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { name: 'Button', props: 'variant, size, disabled', description: 'Botones principales y secundarios' },
                          { name: 'Card', props: 'className', description: 'Contenedores con header, content, footer' },
                          { name: 'Dialog', props: 'open, onOpenChange', description: 'Modales y popups' },
                          { name: 'Select', props: 'value, onValueChange', description: 'Selecciones dropdown' },
                          { name: 'Tabs', props: 'value, onValueChange', description: 'Navegación por pestañas' },
                          { name: 'Badge', props: 'variant', description: 'Etiquetas y estados' },
                          { name: 'Switch', props: 'checked, onCheckedChange', description: 'Toggles on/off' },
                          { name: 'Calendar', props: 'selected, onSelect', description: 'Selector de fechas' },
                          { name: 'Table', props: 'data, columns', description: 'Tablas de datos' },
                          { name: 'Input', props: 'type, placeholder, value', description: 'Campos de entrada' },
                          { name: 'Textarea', props: 'placeholder, rows', description: 'Texto multilínea' },
                          { name: 'Checkbox', props: 'checked, onCheckedChange', description: 'Selección múltiple' }
                        ].map((comp) => (
                          <div key={comp.name} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{comp.name}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{comp.description}</p>
                            <code className="text-xs">{comp.props}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Custom Components */}
                    <div>
                      <h3 className="font-semibold mb-4">Componentes Personalizados</h3>
                      <div className="space-y-3">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Navigation</h4>
                          <p className="text-sm text-muted-foreground mb-2">Navegación principal con tabs responsivos</p>
                          <code className="text-xs">activeTab: string, onTabChange: (tab: string) =&gt; void</code>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">DemoFAB</h4>
                          <p className="text-sm text-muted-foreground mb-2">Floating Action Button para cambio de roles</p>
                          <code className="text-xs">Sin props - Lee del contexto global</code>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">FrameViewer</h4>
                          <p className="text-sm text-muted-foreground mb-2">Visor de frames con filtros y breakpoints</p>
                          <code className="text-xs">Sin props - Sistema autónomo</code>
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">Módulos Principales</h4>
                          <p className="text-sm text-muted-foreground mb-2">10 módulos del sistema con funcionalidades completas</p>
                          <div className="flex flex-wrap gap-1 text-xs">
                            {['Agenda', 'Reservas', 'Pujas', 'Perfil', 'Marketplace', 'Gastronomía', 'Streaming', 'Dashboard', 'Arquitectura', 'README'].map(mod => (
                              <Badge key={mod} variant="outline" className="text-xs">{mod}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Mock Data Section */}
            {activeSection === 'mockdata' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Mock Data JSON
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Datos de prueba completos ubicados en <code>/data/mockData.ts</code>. 
                      Los principales tipos de datos incluyen:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">📋 Tipos Principales</h4>
                        <ul className="text-sm space-y-1">
                          <li>• UserRole (5 roles)</li>
                          <li>• User, Event, Space</li>
                          <li>• Reservation, Bid</li>
                          <li>• Artwork, Artist</li>
                          <li>• MenuItem, Order</li>
                          <li>• Stream</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">📊 Datos de Ejemplo</h4>
                        <ul className="text-sm space-y-1">
                          <li>• 5 usuarios (uno por rol)</li>
                          <li>• 3 eventos con estados diferentes</li>
                          <li>• 3 espacios con equipamiento</li>
                          <li>• 2 reservas y pujas</li>
                          <li>• 2 artistas con portfolio</li>
                          <li>• KPIs y gráficos dashboard</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">🎯 Estados Simulados</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Eventos: upcoming, sold-out</li>
                          <li>• Reservas: pending, confirmed</li>
                          <li>• Pujas: pending, accepted</li>
                          <li>• Pedidos: confirmed, cancelled</li>
                          <li>• Streaming: live, scheduled</li>
                        </ul>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">📱 Responsive Data</h4>
                        <ul className="text-sm space-y-1">
                          <li>• URLs de imágenes Unsplash</li>
                          <li>• Fechas realistas</li>
                          <li>• Precios en pesos argentinos</li>
                          <li>• Datos de analytics</li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">🔧 Cómo usar los datos</h4>
                      <p className="text-sm">
                        Todos los datos están exportados desde <code>/data/mockData.ts</code> y se pueden 
                        importar directamente en cualquier componente. Los datos incluyen relaciones 
                        entre entidades (por ejemplo, reservas vinculadas a usuarios y espacios).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Prototype Instructions Section */}
            {activeSection === 'prototype' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Instrucciones de Prototipado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* FAB Instructions */}
                    <div className="p-4 border-l-4 border-primary bg-primary/5 rounded-r-lg">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Cambio de Roles con FAB
                      </h3>
                      <div className="space-y-3 text-sm">
                        <p><strong>Ubicación:</strong> Botón flotante en esquina inferior derecha</p>
                        <p><strong>Función:</strong> Permite cambiar entre los 5 roles del sistema en tiempo real</p>
                        <div className="bg-background p-3 rounded border">
                          <p className="font-medium mb-2">Roles disponibles:</p>
                          <ul className="space-y-1 text-xs">
                            <li>🔵 <strong>Visitante:</strong> Ve eventos públicos, streaming gratuito</li>
                            <li>🟣 <strong>Artista:</strong> Gestiona portfolio, recibe contrataciones</li>
                            <li>🟢 <strong>Cliente:</strong> Compra tickets, hace reservas, pide comida</li>
                            <li>🟡 <strong>Operaciones:</strong> Gestiona eventos, aprueba reservas</li>
                            <li>🔴 <strong>Admin/Dueños:</strong> Acceso total, dashboard completo</li>
                          </ul>
                        </div>
                        <p><strong>Uso:</strong> Click en FAB → Seleccionar rol → La interfaz se actualiza automáticamente</p>
                      </div>
                    </div>

                    {/* Payment Simulation */}
                    <div className="p-4 border-l-4 border-green-500 bg-green-500/5 rounded-r-lg">
                      <h3 className="font-semibold mb-3">💳 Simulación de Pagos</h3>
                      <div className="space-y-3 text-sm">
                        <p>Los procesos de pago son simulados con animaciones y confirmaciones realistas:</p>
                        <div className="space-y-2">
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Compra de Tickets</p>
                            <p className="text-xs text-muted-foreground">Agenda → Evento → "Comprar" → Checkout simulado → Confirmación con QR</p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Reserva de Espacios</p>
                            <p className="text-xs text-muted-foreground">Reservas → Wizard completo → Resumen → Pago simulado → Estado "pending"</p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Compra de Arte</p>
                            <p className="text-xs text-muted-foreground">Marketplace → Obra → "Comprar" → Proceso de pago → Factura simulada</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* QR Codes */}
                    <div className="p-4 border-l-4 border-blue-500 bg-blue-500/5 rounded-r-lg">
                      <h3 className="font-semibold mb-3">📱 Códigos QR Simulados</h3>
                      <div className="space-y-3 text-sm">
                        <p>Los QR codes se generan automáticamente para diferentes propósitos:</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Tickets de Eventos</p>
                            <p className="text-xs text-muted-foreground">QR único por entrada</p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Menú Digital</p>
                            <p className="text-xs text-muted-foreground">QR para acceso al menú</p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Reservas Confirmadas</p>
                            <p className="text-xs text-muted-foreground">QR de acceso al espacio</p>
                          </div>
                          <div className="bg-background p-3 rounded border">
                            <p className="font-medium">Streaming Premium</p>
                            <p className="text-xs text-muted-foreground">QR para acceso a streams</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Tips */}
                    <div className="p-4 border-l-4 border-orange-500 bg-orange-500/5 rounded-r-lg">
                      <h3 className="font-semibold mb-3">🧭 Tips de Navegación</h3>
                      <div className="space-y-2 text-sm">
                        <p>• <strong>Demo Banner:</strong> Siempre visible en el header - indica que son datos falsos</p>
                        <p>• <strong>Responsive:</strong> Probar en diferentes tamaños de pantalla</p>
                        <p>• <strong>Tema Oscuro/Claro:</strong> Toggle en el header</p>
                        <p>• <strong>Frames Viewer:</strong> Solo visible para rol Admin - documenta todas las pantallas</p>
                        <p>• <strong>Estados de Loading:</strong> Simulados con delays realistas</p>
                        <p>• <strong>Toast Notifications:</strong> Feedback en tiempo real de todas las acciones</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Checklist Section */}
            {activeSection === 'checklist' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Checklist de Funcionalidades por Área
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Events Area */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          🎫 Área de Eventos
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr className="text-left">
                                <th className="pb-2 font-medium">Funcionalidad</th>
                                <th className="pb-2 font-medium">Estado</th>
                                <th className="pb-2 font-medium">Descripción</th>
                                <th className="pb-2 font-medium">Roles</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr className="py-2">
                                <td className="py-2">Vista de Agenda</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Lista y grid de eventos con filtros</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Detalle de Evento</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Información completa + compra</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Compra de Tickets</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Checkout simulado con QR</td>
                                <td>Cliente+</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Gestión de Eventos</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">CRUD para administradores</td>
                                <td>Operaciones, Admin</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <Separator />

                      {/* Gastronomy Area */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          🍽️ Área de Gastronomía
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr className="text-left">
                                <th className="pb-2 font-medium">Funcionalidad</th>
                                <th className="pb-2 font-medium">Estado</th>
                                <th className="pb-2 font-medium">Descripción</th>
                                <th className="pb-2 font-medium">Roles</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr className="py-2">
                                <td className="py-2">Menú Digital</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Catálogo con categorías y filtros</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Sistema de Pedidos</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Carrito y checkout</td>
                                <td>Cliente+</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">QR del Menú</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Acceso rápido desde móvil</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Estado de Pedidos</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Tracking en tiempo real</td>
                                <td>Cliente+</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <Separator />

                      {/* Marketplace Area */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          🎨 Marketplace de Artistas
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="border-b">
                              <tr className="text-left">
                                <th className="pb-2 font-medium">Funcionalidad</th>
                                <th className="pb-2 font-medium">Estado</th>
                                <th className="pb-2 font-medium">Descripción</th>
                                <th className="pb-2 font-medium">Roles</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              <tr className="py-2">
                                <td className="py-2">Catálogo de Artistas</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Grid con filtros y búsqueda</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Portfolio Individual</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Galería y bio del artista</td>
                                <td>Todos</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Compra de Obras</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Proceso completo de compra</td>
                                <td>Cliente+</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Contratación</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Solicitud de servicios</td>
                                <td>Cliente+</td>
                              </tr>
                              <tr className="py-2">
                                <td className="py-2">Gestión de Portfolio</td>
                                <td><Badge className="bg-green-100 text-green-800">✅ Completo</Badge></td>
                                <td className="text-muted-foreground">Panel para artistas</td>
                                <td>Artista</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <Separator />

                      {/* Additional Areas */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          ⚙️ Áreas Adicionales
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">📅 Reservas & Pujas</h4>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Wizard de reserva completo</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Sistema de pujas funcional</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Gestión de espacios</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Calendario integrado</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">📺 Streaming</h4>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Player de video simulado</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Chat en vivo mockup</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Contenido premium por roles</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Programación de streams</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">📊 Dashboard</h4>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> KPIs en tiempo real</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Gráficos interactivos</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Reportes por categoría</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Analytics de engagement</li>
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">👤 Perfiles & Sistema</h4>
                            <ul className="text-sm space-y-1">
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Gestión de cuentas</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Historial de transacciones</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Configuraciones GDPR</li>
                              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Documentación técnica</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Roles Section */}
            {activeSection === 'roles' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Sistema de Roles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: 'Visitante', color: 'bg-gray-500', permissions: ['Ver eventos públicos', 'Ver marketplace', 'Ver streaming gratuito', 'Acceso sin registro'] },
                        { name: 'Cliente', color: 'bg-blue-500', permissions: ['Comprar tickets', 'Hacer reservas', 'Realizar pedidos', 'Acceso a contenido premium'] },
                        { name: 'Artista', color: 'bg-purple-500', permissions: ['Gestionar portfolio', 'Recibir contrataciones', 'Subir obras', 'Streaming propio'] },
                        { name: 'Operaciones', color: 'bg-green-500', permissions: ['Gestionar eventos', 'Administrar reservas', 'Aprobar solicitudes', 'Gestionar espacios'] },
                        { name: 'Admin/Dueños', color: 'bg-red-500', permissions: ['Acceso total al sistema', 'Ver analytics completos', 'Gestionar usuarios', 'Configuraciones globales'] }
                      ].map((role) => (
                        <div key={role.name} className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-4 h-4 rounded ${role.color}`}></div>
                            <h3 className="font-semibold">{role.name}</h3>
                          </div>
                          <div className="grid gap-2">
                            {role.permissions.map((permission) => (
                              <div key={permission} className="flex items-center gap-2 text-sm">
                                <Check className="h-3 w-3 text-green-500" />
                                <span>{permission}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>FAB de Testing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        <Settings className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Floating Action Button</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Botón flotante especial que permite cambiar entre roles en tiempo real para 
                          probar la visibilidad condicional de componentes y funcionalidades.
                        </p>
                        <Badge variant="outline">Visible solo en demo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Deployment Section */}
            {activeSection === 'deployment' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="h-5 w-5" />
                      Deployment y Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Frontend Completo
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Aplicación React completamente funcional con todos los módulos implementados y mock data realista.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Design System Completo
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Tokens, componentes y guidelines documentados. Tema claro/oscuro implementado.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          Documentación y Handoff
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          README técnico, Frame Viewer y todas las instrucciones para desarrolladores incluidas.
                        </p>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          Backend Requerido para Producción
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Para producción, será necesario implementar APIs reales, base de datos y sistema de autenticación.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Pasos Recomendados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">1. Implementar Backend</p>
                          <p className="text-sm text-muted-foreground">APIs REST/GraphQL, autenticación JWT, base de datos PostgreSQL/MongoDB</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">2. Integrar Pagos</p>
                          <p className="text-sm text-muted-foreground">MercadoPago, Stripe u otros proveedores de pago locales</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">3. Testing y QA</p>
                          <p className="text-sm text-muted-foreground">Tests unitarios con Jest, tests E2E con Playwright, testing de accesibilidad</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <div>
                          <p className="font-medium">4. Deploy y CI/CD</p>
                          <p className="text-sm text-muted-foreground">Vercel/Netlify para frontend, AWS/Docker para backend, configurar pipelines</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Proyecto:</strong> ElCastilloBarracas Frontend</p>
                          <p><strong>Fecha de entrega:</strong> Enero 2024</p>
                          <p><strong>Estado:</strong> Demo completo listo para handoff</p>
                        </div>
                        <div>
                          <p><strong>Tecnología:</strong> React + TypeScript + Tailwind</p>
                          <p><strong>Componentes:</strong> 10 módulos + Frame Viewer</p>
                          <p><strong>Documentación:</strong> Completa e incluida</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};