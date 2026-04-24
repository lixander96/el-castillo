import React, { useState } from 'react';
import { mockMenuItems } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ShoppingCart, UtensilsCrossed, Plus, Minus } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const Gastronomia: React.FC = () => {
  const { currentRole } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const isAuthorized = ['visitante', 'cliente', 'operaciones', 'admin'].includes(currentRole);

  const addToCart = (item: typeof mockMenuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
    toast.success(`${item.name} añadido al carrito`);
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Acceso restringido</h3>
          <p className="text-muted-foreground">
            No tienes permisos para acceder al menú gastronómico.
          </p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(mockMenuItems.map(item => item.category)))];
  const filteredItems = mockMenuItems.filter(item => 
    activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Gastronomía</h1>
          <p className="text-muted-foreground">
            Menú digital con pedido anticipado para eventos
          </p>
        </div>
        
        {cart.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrito ({cart.length}) - ${cartTotal.toLocaleString()}
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="Entrada">Entradas</TabsTrigger>
          <TabsTrigger value="Bebida">Bebidas</TabsTrigger>
          <TabsTrigger value="Principal">Principales</TabsTrigger>
          <TabsTrigger value="Postre">Postres</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {item.name}
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? 'Disponible' : 'Agotado'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      ${item.price.toLocaleString()}
                    </span>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      onClick={() => addToCart(item)}
                      disabled={!item.available}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                    
                    {cart.find(cartItem => cartItem.id === item.id) && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium">
                          {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                        </span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {['operaciones', 'admin'].includes(currentRole) && (
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Catering</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium">Solicitud de Catering - Evento #123</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Tipo: Coffee break</p>
                  <p>Personas: 50</p>
                  <p>Restricciones: 5 vegetarianos, 2 celíacos</p>
                  <p>Horario: 15:00 - 17:00</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm">Aprobar</Button>
                  <Button size="sm" variant="outline">Modificar</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};