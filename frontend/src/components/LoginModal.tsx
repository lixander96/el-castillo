import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AuthTabs } from './auth/AuthTabs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acceder a El Castillo Barracas</DialogTitle>
          <DialogDescription>
            Inicia sesion o crea una cuenta para acceder a todas las funcionalidades.
          </DialogDescription>
        </DialogHeader>

        <AuthTabs onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}

