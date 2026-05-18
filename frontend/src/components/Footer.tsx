import React from 'react';
import { Separator } from './ui/separator';
import logo_black from 'figma:asset/logo-black.png';
import logo_white from 'figma:asset/logo-white.png';
import { useApp } from '../contexts/AppContext';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { theme, siteSettings } = useApp();

  const logoSrc = theme === 'dark'
    ? (siteSettings?.logoDarkUrl || logo_white)
    : (siteSettings?.logoLightUrl || logo_black);
  const siteName = siteSettings?.siteName || 'El Castillo Barracas';
  const siteTagline = siteSettings?.siteTagline || 'Centro Cultural y de Eventos';

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Logo y nombre */}
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt={siteName}
              className="h-12 w-auto"
            />
            <div className="text-center">
              <h3 className="font-bold text-lg">{siteName}</h3>
              <p className="text-sm text-muted-foreground">{siteTagline}</p>
            </div>
          </div>

          <Separator className="w-full max-w-md" />

          {/* Copyright */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} {siteName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
