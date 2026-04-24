import React from 'react';
import { Separator } from './ui/separator';
import logo from 'figma:asset/c5d238e13a04c39ffd5ba7452e5da3d9de4080c7.png';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="El Castillo Barracas" 
              className="h-12 w-auto"
            />
            <div className="text-center">
              <h3 className="font-bold text-lg">El Castillo Barracas</h3>
              <p className="text-sm text-muted-foreground">Centro Cultural y de Eventos</p>
            </div>
          </div>

          <Separator className="w-full max-w-md" />

          {/* Información de contacto */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              Espacio multicultural en el corazón de Barracas
            </p>
            <p className="text-sm text-muted-foreground">
              Eventos • Arte • Gastronomía • Cultura
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} El Castillo Barracas. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Aplicación demo con datos simulados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};