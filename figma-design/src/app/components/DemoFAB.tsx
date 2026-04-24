import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../data/mockData';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Settings, RotateCcw, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const roleLabels: Record<UserRole, string> = {
  publico: 'Publico (Sin loguear)',
  visitante: 'Visitante',
  artista: 'Artista',
  cliente: 'Cliente de Eventos',
  operaciones: 'Equipo de Operaciones',
  admin: 'Dueños / Administradores'
};

const roleColors: Record<UserRole, string> = {
  publico: 'bg-gray-500',
  visitante: 'bg-blue-500',
  artista: 'bg-purple-500',
  cliente: 'bg-green-500',
  operaciones: 'bg-orange-500',
  admin: 'bg-red-500'
};

export const DemoFAB: React.FC = () => {
  const { currentRole, setCurrentRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setIsOpen(false);
  };

  const handleReset = () => {
    setCurrentRole('publico');
    setIsOpen(false);
  };

  const handleLogout = () => {
    setCurrentRole('publico');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            aria-label="Demo controls"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-4" 
          side="top" 
          align="end"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Control de Demo</h3>
              <Badge 
                variant="secondary" 
                className={`${roleColors[currentRole]} text-white`}
              >
                DEMO
              </Badge>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm">Rol actual:</label>
              <Select value={currentRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full ${roleColors[role as UserRole]}`} 
                        />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t space-y-2">
              {currentRole !== 'publico' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Demo
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Cambia entre roles para ver diferentes funcionalidades y permisos
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};