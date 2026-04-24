/**
 * Design System Demo
 * Página de demostración de todos los tokens y componentes del design system
 */

import React from 'react';
import { cn } from '../components/ui/utils';
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  Modal,
  Tooltip,
  colorTokens,
  typographyTokens,
  spacingTokens,
} from './index';
import { 
  Heart, 
  Star, 
  User, 
  Mail, 
  Settings, 
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export const DesignSystemDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectValue, setSelectValue] = React.useState('');

  const selectOptions = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3' },
    { value: 'option4', label: 'Opción 4 (Deshabilitada)', disabled: true },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">ElCastilloBarracas Design System</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Sistema completo de tokens de diseño y componentes atómicos con soporte dark/light y accesibilidad AA
        </p>
      </div>

      {/* Color Tokens */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tokens de Color</h2>
        
        {/* Semantic Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Colores Semánticos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorTokens.semantic).map(([name, shades]) => (
              <div key={name} className="space-y-2">
                <h4 className="text-sm font-medium capitalize">{name}</h4>
                <div className="space-y-1">
                  {Object.entries(shades).map(([shade, color]) => (
                    <div
                      key={`${name}-${shade}`}
                      className="h-8 rounded flex items-center px-2 text-xs font-mono"
                      style={{ backgroundColor: color }}
                    >
                      {shade}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Colors */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Colores de Marca</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorTokens.brand).map(([name, color]) => (
              <div key={name} className="space-y-2">
                <div
                  className="h-16 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: color }}
                >
                  {name}
                </div>
                <p className="text-xs font-mono text-center">{color}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tipografía</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Jerarquía de Títulos</h3>
          <div className="space-y-4">
            {Object.entries(typographyTokens.heading).map(([level, styles]) => (
              <div key={level} className="border-l-4 border-primary pl-4">
                <div 
                  className="font-display"
                  style={{
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight,
                    letterSpacing: styles.letterSpacing,
                  }}
                >
                  {level.toUpperCase()} - Lorem ipsum dolor sit amet
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {styles.fontSize} / {styles.fontWeight} / {styles.lineHeight}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Cuerpo de Texto</h3>
          <div className="space-y-4">
            {Object.entries(typographyTokens.body).map(([size, styles]) => (
              <div key={size} className="border-l-4 border-secondary pl-4">
                <div 
                  style={{
                    fontSize: styles.fontSize,
                    fontWeight: styles.fontWeight,
                    lineHeight: styles.lineHeight,
                    letterSpacing: styles.letterSpacing,
                  }}
                >
                  {size} - Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {styles.fontSize} / {styles.fontWeight} / {styles.lineHeight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Espaciado</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Escala de Espaciado</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {Object.entries(spacingTokens.space).slice(0, 20).map(([scale, value]) => (
              <div key={scale} className="text-center space-y-2">
                <div 
                  className="bg-primary mx-auto rounded"
                  style={{ 
                    width: value,
                    height: value,
                    minWidth: '4px',
                    minHeight: '4px'
                  }}
                />
                <div className="text-xs">
                  <div className="font-medium">{scale}</div>
                  <div className="text-muted-foreground">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Button Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Botones</h2>
        
        <div className="space-y-6">
          {/* Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variantes</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tamaños</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </div>

          {/* States */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estados</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          {/* With Icons */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Con Íconos</h3>
            <div className="flex flex-wrap gap-4">
              <Button leftIcon={<Heart className="h-4 w-4" />}>Con ícono izquierdo</Button>
              <Button rightIcon={<Star className="h-4 w-4" />}>Con ícono derecho</Button>
              <Button iconOnly><Settings className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Tones */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tonos</h3>
            <div className="flex flex-wrap gap-4">
              <Button tone="success">Success</Button>
              <Button tone="warning">Warning</Button>
              <Button tone="error">Error</Button>
              <Button tone="info">Info</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Input Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Inputs</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variantes y Tamaños</h3>
            <Input 
              label="Default Input" 
              placeholder="Texto aquí..." 
            />
            <Input 
              label="Input con ícono" 
              placeholder="Email..." 
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Input 
              label="Input grande" 
              placeholder="Texto grande..." 
              size="lg"
            />
            <Input 
              label="Input pequeño" 
              placeholder="Texto pequeño..." 
              size="sm"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Estados de Validación</h3>
            <Input 
              label="Success" 
              defaultValue="Entrada válida"
              state="success"
              helpText="Todo correcto"
              leftIcon={<CheckCircle className="h-4 w-4" />}
            />
            <Input 
              label="Warning" 
              defaultValue="Entrada dudosa"
              state="warning"
              helpText="Revisa este campo"
              leftIcon={<AlertTriangle className="h-4 w-4" />}
            />
            <Input 
              label="Error" 
              defaultValue="Entrada inválida"
              state="error"
              helpText="Este campo es requerido"
              leftIcon={<XCircle className="h-4 w-4" />}
            />
            <Input 
              label="Disabled" 
              defaultValue="Campo deshabilitado"
              disabled
            />
          </div>
        </div>
      </section>

      {/* Select Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Select</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Básico</h3>
            <Select
              label="Selecciona una opción"
              options={selectOptions}
              value={selectValue}
              onValueChange={setSelectValue}
              placeholder="Elegir..."
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select con Estados</h3>
            <Select
              label="Select con error"
              options={selectOptions}
              state="error"
              helpText="Debes seleccionar una opción"
            />
            <Select
              label="Select deshabilitado"
              options={selectOptions}
              disabled
            />
          </div>
        </div>
      </section>

      {/* Badge Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Badges</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variantes</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tamaños</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="xs">Extra Small</Badge>
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Con Íconos y Contadores</h3>
            <div className="flex flex-wrap gap-2">
              <Badge leftIcon={<Star className="h-3 w-3" />}>Con ícono</Badge>
              <Badge count={5} variant="primary" />
              <Badge count={99} variant="error" />
              <Badge count={150} variant="info" />
              <Badge dot variant="success" />
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Avatares</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tamaños</h3>
            <div className="flex items-center gap-4">
              <Avatar size="xs" initials="XS" />
              <Avatar size="sm" initials="SM" />
              <Avatar size="md" initials="MD" />
              <Avatar size="lg" initials="LG" />
              <Avatar size="xl" initials="XL" />
              <Avatar size="2xl" initials="2XL" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Formas</h3>
            <div className="flex items-center gap-4">
              <Avatar shape="circle" initials="C" />
              <Avatar shape="rounded" initials="R" />
              <Avatar shape="square" initials="S" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Con Estados</h3>
            <div className="flex items-center gap-4">
              <Avatar initials="ON" status="online" showStatus />
              <Avatar initials="AW" status="away" showStatus />
              <Avatar initials="BS" status="busy" showStatus />
              <Avatar initials="OF" status="offline" showStatus />
            </div>
          </div>
        </div>
      </section>

      {/* Card Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes - Cards</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Básica</CardTitle>
              <CardDescription>
                Esta es una descripción de la card básica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Contenido de la card aquí.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Card Elevada</CardTitle>
              <CardDescription>
                Con sombra y efecto hover
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta card tiene sombra por defecto.</p>
            </CardContent>
          </Card>

          <Card interactive onClick={() => alert('Card clickeada!')}>
            <CardHeader>
              <CardTitle>Card Interactiva</CardTitle>
              <CardDescription>
                Haz click para ver la acción
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Esta card es clickeable.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Interactive Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Componentes Interactivos</h2>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Modal</h3>
            <Button onClick={() => setModalOpen(true)}>
              Abrir Modal
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tooltips</h3>
            <div className="flex gap-4">
              <Tooltip content="Tooltip arriba" side="top">
                <Button variant="outline">Hover - Top</Button>
              </Tooltip>
              <Tooltip content="Tooltip a la derecha" side="right">
                <Button variant="outline">Hover - Right</Button>
              </Tooltip>
              <Tooltip content="Tooltip abajo" side="bottom">
                <Button variant="outline">Hover - Bottom</Button>
              </Tooltip>
              <Tooltip content="Tooltip a la izquierda" side="left">
                <Button variant="outline">Hover - Left</Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Component */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal de Ejemplo"
        description="Este es un modal de demostración del design system"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setModalOpen(false)}>
              Confirmar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p>
            Este modal demuestra la implementación del componente Modal 
            del design system con header, contenido y footer.
          </p>
          <Input 
            label="Campo de ejemplo"
            placeholder="Puedes interactuar con elementos dentro del modal"
          />
        </div>
      </Modal>
    </div>
  );
};