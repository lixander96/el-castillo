import React, { useState } from 'react';
import { mockArtworks, mockArtists, Artwork } from '../../data/mockData';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Plus, 
  Upload, 
  ShoppingCart, 
  MessageCircle, 
  Star, 
  Eye,
  Heart,
  Share,
  Palette,
  CheckCircle,
  CreditCard,
  Percent,
  DollarSign,
  Receipt
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PaymentProcessor, usePaymentProcessor, PaymentResult } from '../PaymentProcessor';
import { toast } from 'sonner@2.0.3';

interface ArtworkForm {
  title: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  exclusiveContent: boolean;
  image: string;
}

const categories = ['Pintura', 'Escultura', 'Fotografía', 'Arte Digital', 'Instalación', 'Dibujo'];

export const Marketplace: React.FC = () => {
  const { currentRole } = useApp();
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadStep, setUploadStep] = useState<'form' | 'preview' | 'success'>('form');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [artworkForm, setArtworkForm] = useState<ArtworkForm>({
    title: '',
    description: '',
    price: 0,
    category: '',
    available: true,
    exclusiveContent: false,
    image: ''
  });

  const { 
    isOpen: isPaymentOpen, 
    paymentData, 
    processPayment, 
    closePayment, 
    onSuccessCallback, 
    onErrorCallback 
  } = usePaymentProcessor();

  const PLATFORM_COMMISSION = 10; // 10% commission

  const isArtist = currentRole === 'artista';
  const canPurchase = ['visitante', 'acceso', 'admin'].includes(currentRole);

  const filteredArtworks = mockArtworks.filter(artwork => {
    if (selectedCategory === 'all') return true;
    return artwork.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const generatePreviewImage = () => {
    // In a real app, this would use the actual uploaded image
    const artCategories = {
      'Pintura': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      'Escultura': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
      'Fotografía': 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=600&fit=crop',
      'Arte Digital': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
      'Instalación': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop',
      'Dibujo': 'https://images.unsplash.com/photo-1578632292335-e3efcbc54906?w=800&h=600&fit=crop'
    };
    return artCategories[artworkForm.category as keyof typeof artCategories] || artCategories['Pintura'];
  };

  const handlePreviewArtwork = () => {
    if (!artworkForm.title || !artworkForm.category || !artworkForm.description) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    setUploadStep('preview');
  };

  const handleUploadArtwork = () => {
    setUploadStep('success');
    
    // Simulate upload process
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('Obra subida exitosamente');
        }, 2000);
      }),
      {
        loading: 'Subiendo obra...',
        success: 'Obra subida exitosamente y añadida a tu catálogo',
        error: 'Error al subir la obra'
      }
    );

    // Reset after successful upload
    setTimeout(() => {
      setShowUploadForm(false);
      setUploadStep('form');
      setArtworkForm({
        title: '',
        description: '',
        price: 0,
        category: '',
        available: true,
        exclusiveContent: false,
        image: ''
      });
    }, 3000);
  };

  const calculateCommission = (price: number) => {
    return Math.ceil(price * (PLATFORM_COMMISSION / 100));
  };

  const calculateArtistAmount = (price: number) => {
    return price - calculateCommission(price);
  };

  const handlePurchaseArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setShowPurchaseModal(true);
  };

  const processPurchase = (artwork: Artwork) => {
    const commission = calculateCommission(artwork.price);
    
    processPayment(
      {
        amount: artwork.price,
        type: 'commission',
        description: `Compra de obra: ${artwork.title}`,
        metadata: {
          productId: artwork.id,
          commission: PLATFORM_COMMISSION,
          artistAmount: calculateArtistAmount(artwork.price),
          commissionAmount: commission
        }
      },
      (result: PaymentResult) => {
        // Success callback
        if (result.status === 'success') {
          // Store purchase in localStorage
          const purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
          const newPurchase = {
            id: Date.now().toString(),
            artworkId: artwork.id,
            artworkTitle: artwork.title,
            artistId: artwork.artistId,
            price: artwork.price,
            commission: commission,
            artistAmount: calculateArtistAmount(artwork.price),
            transactionId: result.transactionId,
            purchaseDate: new Date().toISOString(),
            status: 'completed'
          };
          purchases.push(newPurchase);
          localStorage.setItem('userPurchases', JSON.stringify(purchases));
          
          setShowPurchaseModal(false);
          toast.success(`¡Compra exitosa! Has adquirido "${artwork.title}"`);
        }
      },
      (error: string) => {
        // Error callback
        toast.error(`Error en la compra: ${error}`);
      }
    );
  };

  const handleContactArtist = () => {
    toast.success('Mensaje enviado al artista');
    setShowContactForm(false);
  };

  const getArtistById = (artistId: string) => {
    return mockArtists.find(artist => artist.id === artistId);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1>Marketplace de Artistas</h1>
          <p className="text-muted-foreground">
            Descubre y adquiere obras de arte únicas
          </p>
        </div>
        
        <div className="flex gap-2">
          {isArtist && (
            <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Subir Obra
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {uploadStep === 'form' && 'Subir Nueva Obra'}
                    {uploadStep === 'preview' && 'Vista Previa de la Obra'}
                    {uploadStep === 'success' && '¡Obra Subida Exitosamente!'}
                  </DialogTitle>
                  <DialogDescription>
                    {uploadStep === 'form' && 'Completa los datos de tu obra de arte'}
                    {uploadStep === 'preview' && 'Revisa cómo se verá tu obra antes de publicarla'}
                    {uploadStep === 'success' && 'Tu obra ha sido añadida al marketplace'}
                  </DialogDescription>
                </DialogHeader>
                
                {uploadStep === 'form' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Imagen de la obra (Demo)</Label>
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Arrastra una imagen aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Formatos: JPG, PNG, PDF, Video (máx. 50MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={artworkForm.title}
                        onChange={(e) => setArtworkForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Título de la obra"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <Select 
                        value={artworkForm.category} 
                        onValueChange={(value) => setArtworkForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={artworkForm.description}
                      onChange={(e) => setArtworkForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe tu obra, técnica utilizada, inspiración..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={artworkForm.price}
                        onChange={(e) => setArtworkForm(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        placeholder="Precio de venta"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Disponibilidad</Label>
                      <div className="flex items-center space-x-2 h-10">
                        <Switch
                          checked={artworkForm.available}
                          onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, available: checked }))}
                        />
                        <span className="text-sm">
                          {artworkForm.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={artworkForm.exclusiveContent}
                        onCheckedChange={(checked) => setArtworkForm(prev => ({ ...prev, exclusiveContent: checked }))}
                      />
                      <Label>Contenido exclusivo para suscriptores</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Los suscriptores podrán acceder a contenido adicional como process videos, sketches, etc.
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Certificado Digital (NFT Opcional)</h4>
                    <p className="text-sm text-muted-foreground">
                      Puedes generar un certificado digital para tu obra que garantice su autenticidad.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handlePreviewArtwork} 
                      className="flex-1"
                    >
                      Vista Previa
                    </Button>
                  </div>
                </div>
                )}

                {uploadStep === 'preview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preview Card */}
                    <div>
                      <h3 className="font-medium mb-3">Como se verá en el marketplace:</h3>
                      <Card className="overflow-hidden">
                        <div className="relative group">
                          <ImageWithFallback
                            src={generatePreviewImage()}
                            alt={artworkForm.title}
                            className="w-full h-64 object-cover"
                          />
                          
                          {artworkForm.exclusiveContent && (
                            <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Exclusivo
                            </Badge>
                          )}
                        </div>

                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="truncate">{artworkForm.title}</span>
                            <Badge variant={artworkForm.available ? "default" : "secondary"}>
                              {artworkForm.available ? 'Disponible' : 'No disponible'}
                            </Badge>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" />
                              <AvatarFallback className="text-xs">TU</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">Tu nombre</span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {artworkForm.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">
                              ${artworkForm.price.toLocaleString()}
                            </span>
                            <Badge variant="outline">{artworkForm.category}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Details Summary */}
                    <div>
                      <h3 className="font-medium mb-3">Resumen de la publicación:</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Detalles de la obra</h4>
                          <div className="space-y-2 text-sm">
                            <div><strong>Título:</strong> {artworkForm.title}</div>
                            <div><strong>Categoría:</strong> {artworkForm.category}</div>
                            <div><strong>Precio:</strong> ${artworkForm.price.toLocaleString()}</div>
                            <div><strong>Estado:</strong> {artworkForm.available ? 'Disponible' : 'No disponible'}</div>
                            {artworkForm.exclusiveContent && (
                              <div><strong>Contenido exclusivo:</strong> Sí</div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-2">Descripción</h4>
                          <p className="text-sm">{artworkForm.description}</p>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                            💎 Características premium
                          </h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Certificado de autenticidad digital</li>
                            <li>• Sistema de pagos integrado</li>
                            <li>• Notificaciones en tiempo real</li>
                            <li>• Analytics de visualizaciones</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadStep('form')}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={handleUploadArtwork} 
                      className="flex-1"
                    >
                      Confirmar y Publicar
                    </Button>
                  </div>
                </div>
                )}

                {uploadStep === 'success' && (
                <div className="space-y-6 text-center py-8">
                  <div className="p-8 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
                    <h3 className="font-medium mb-2">¡Obra publicada exitosamente!</h3>
                    <p className="text-sm text-muted-foreground">
                      Tu obra "{artworkForm.title}" ya está disponible en el marketplace
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">Visibilidad</div>
                      <div className="text-muted-foreground">Pública en marketplace</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">Estado</div>
                      <div className="text-muted-foreground">Activa y disponible</div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <h4 className="font-medium mb-2">Próximos pasos:</h4>
                    <ul className="text-sm text-left space-y-1">
                      <li>• Comparte tu obra en redes sociales</li>
                      <li>• Responde a mensajes de compradores interesados</li>
                      <li>• Revisa las estadísticas en tu perfil de artista</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => {
                      setShowUploadForm(false);
                      setUploadStep('form');
                    }}
                    className="w-full"
                  >
                    Cerrar
                  </Button>
                </div>
                )}
              </DialogContent>
            </Dialog>
          )}

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Explorar Obras</TabsTrigger>
          <TabsTrigger value="artists">Artistas</TabsTrigger>
          {isArtist && <TabsTrigger value="my-works">Mis Obras</TabsTrigger>}
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map(artwork => {
              const artist = getArtistById(artwork.artistId);
              return (
                <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative group">
                    <ImageWithFallback
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-64 object-cover"
                    />
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="absolute bottom-2 right-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedArtwork(artwork)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalle
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>{selectedArtwork?.title}</DialogTitle>
                              <DialogDescription>
                                Detalles de la obra de arte
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <ImageWithFallback
                                  src={selectedArtwork?.image || ''}
                                  alt={selectedArtwork?.title || ''}
                                  className="w-full h-96 object-cover rounded-lg"
                                />
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={artist?.avatar} />
                                    <AvatarFallback>
                                      {artist?.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-medium">{artist?.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {artist?.artworks} obras • {artist?.followers} seguidores
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    {selectedArtwork?.category}
                                  </Badge>
                                  <p className="text-muted-foreground">
                                    {selectedArtwork?.description}
                                  </p>
                                </div>

                                {selectedArtwork?.exclusiveContent && (
                                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-amber-500" />
                                      <span className="text-sm font-medium">Contenido Exclusivo</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Incluye material adicional para suscriptores
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <span className="text-2xl font-bold">
                                    ${selectedArtwork?.price.toLocaleString()}
                                  </span>
                                  <Badge 
                                    variant={selectedArtwork?.available ? "default" : "secondary"}
                                  >
                                    {selectedArtwork?.available ? 'Disponible' : 'No disponible'}
                                  </Badge>
                                </div>

                                <div className="flex gap-2">
                                  {canPurchase && selectedArtwork?.available && (
                                    <Button 
                                      className="flex-1"
                                      onClick={() => selectedArtwork && handlePurchaseArtwork(selectedArtwork)}
                                    >
                                      <ShoppingCart className="h-4 w-4 mr-2" />
                                      Comprar
                                    </Button>
                                  )}
                                  
                                  <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Contactar
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Contactar Artista</DialogTitle>
                                        <DialogDescription>
                                          Envía un mensaje al artista
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="subject">Asunto</Label>
                                          <Input id="subject" placeholder="Consulta sobre la obra" />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="message">Mensaje</Label>
                                          <Textarea 
                                            id="message" 
                                            placeholder="Escribe tu mensaje aquí..."
                                            rows={4}
                                          />
                                        </div>
                                        <Button onClick={handleContactArtist} className="w-full">
                                          Enviar Mensaje
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {artwork.exclusiveContent && (
                      <Badge className="absolute top-2 left-2 bg-amber-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Exclusivo
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{artwork.title}</span>
                      <Badge 
                        variant={artwork.available ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {artwork.available ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={artist?.avatar} />
                        <AvatarFallback className="text-xs">
                          {artist?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">
                        {artist?.name}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {artwork.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">
                        ${artwork.price.toLocaleString()}
                      </span>
                      <Badge variant="outline">{artwork.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="artists" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockArtists.map(artist => (
              <Card key={artist.id} className="text-center">
                <CardHeader>
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={artist.avatar} />
                    <AvatarFallback className="text-2xl">
                      {artist.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle>{artist.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {artist.bio}
                  </p>
                  
                  <div className="flex justify-center gap-4 text-sm">
                    <div>
                      <div className="font-bold">{artist.artworks}</div>
                      <div className="text-muted-foreground">Obras</div>
                    </div>
                    <div>
                      <div className="font-bold">{artist.followers}</div>
                      <div className="text-muted-foreground">Seguidores</div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    Ver Perfil
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isArtist && (
          <TabsContent value="my-works" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Obras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">Aún no has subido obras</h3>
                  <p className="text-muted-foreground mb-4">
                    Comparte tu arte con la comunidad de El Castillo Barracas
                  </p>
                  <Button onClick={() => setShowUploadForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Subir Primera Obra
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
