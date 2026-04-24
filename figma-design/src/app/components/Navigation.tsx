import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { NotificationCenter } from './NotificationCenter';
import { LoginModal } from './LoginModal';
import logo from 'figma:asset/c5d238e13a04c39ffd5ba7452e5da3d9de4080c7.png';
import { 
  Calendar, 
  Building, 
  Gavel, 
  User, 
  Palette, 
  UtensilsCrossed, 
  Video, 
  BarChart3,
  Sun,
  Moon,
  AlertTriangle,
  Layout,
  FileText,
  Bell,
  LogIn,
  Menu,
  LogOut
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['publico', 'visitante', 'artista', 'cliente', 'operaciones', 'admin'] },
  { id: 'reservas', label: 'Reservas', icon: Building, roles: ['cliente', 'operaciones', 'admin'] },
  { id: 'pujas', label: 'Pujas', icon: Gavel, roles: ['cliente', 'operaciones', 'admin'] },
  { id: 'perfil', label: 'Perfil', icon: User, roles: ['visitante', 'artista', 'cliente'] },
  { id: 'marketplace', label: 'Marketplace', icon: Palette, roles: ['publico', 'visitante', 'artista', 'admin'] },
  { id: 'gastronomia', label: 'Gastronomía', icon: UtensilsCrossed, roles: ['publico', 'visitante', 'cliente', 'operaciones', 'admin'] },
  { id: 'streaming', label: 'Streaming', icon: Video, roles: ['publico', 'visitante', 'artista', 'admin'] },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell, roles: ['visitante', 'artista', 'cliente', 'operaciones', 'admin'] },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'operaciones'] },
  { id: 'arquitectura', label: 'Arquitectura', icon: BarChart3, roles: ['admin'] },
  { id: 'readme', label: 'README', icon: FileText, roles: ['admin'] },
  { id: 'designsystem', label: 'Design System', icon: Palette, roles: ['admin'] },
  { id: 'frames', label: 'Frames', icon: Layout, roles: ['admin'] },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { currentRole, currentUser, theme, toggleTheme, logout } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(currentRole)
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>
              {currentUser?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback>
              {currentUser?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{currentUser?.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">
              {currentUser?.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onTabChange('perfil')}>
          <User className="mr-2 h-4 w-4" />
          Mi Perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Demo Banner */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="El Castillo Barracas" 
                className="h-8 md:h-10 w-auto"
              />
              <h1 className="hidden sm:block text-lg md:text-xl font-bold">El Castillo Barracas</h1>
            </div>
            <Badge variant="destructive" className="hidden sm:flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Demo — datos falsos
            </Badge>
          </div>

          {/* Desktop Navigation Items */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-custom px-1 pb-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onTabChange(item.id)}
                    className="flex items-center gap-2 shrink-0 min-w-fit"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline whitespace-nowrap">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>Navegación</SheetTitle>
                  <SheetDescription>
                    Accede a las diferentes secciones de la aplicación
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {currentRole === 'publico' ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Ingresar</span>
              </Button>
            ) : (
              <>
                <div className="hidden md:block">
                  <NotificationCenter onNavigate={onTabChange} />
                </div>
                <UserDropdown />
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Demo Banner */}
        <div className="sm:hidden pb-3">
          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
            <AlertTriangle className="h-3 w-3" />
            Demo — datos falsos
          </Badge>
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </nav>
  );
};