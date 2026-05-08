import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { useApp } from '../../contexts/AppContext';
import { API_URL, loginWithEmail, registerWithEmail } from '../../lib/api';
import { toast } from 'sonner@2.0.3';

interface AuthTabsProps {
  onSuccess?: () => void;
  defaultTab?: 'login' | 'register';
}

const errorMessageFrom = (error: any, fallback: string) => {
  const message = error?.response?.data?.message ?? error?.message ?? fallback;
  if (Array.isArray(message)) return message.join(', ');
  return String(message);
};

export function AuthTabs({ onSuccess, defaultTab = 'login' }: AuthTabsProps) {
  const { setSession } = useApp();

  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSuccess = (message: string) => {
    toast.success(message);
    onSuccess?.();
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const { token, user } = await loginWithEmail(loginData.email.trim(), loginData.password);
      setSession(user, token);
      handleSuccess(`Bienvenido/a ${user.firstName || user.email}`);
    } catch (error) {
      const message = errorMessageFrom(error, 'No se pudo iniciar sesion');
      setLoginError(message);
      toast.error(message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setRegisterError(null);
    if (registerData.password !== registerData.confirmPassword) {
      const message = 'Las contrasenas no coinciden';
      setRegisterError(message);
      toast.error(message);
      return;
    }
    setRegisterLoading(true);
    try {
      const { token, user } = await registerWithEmail({
        email: registerData.email.trim(),
        password: registerData.password,
        firstName: registerData.firstName.trim(),
        lastName: registerData.lastName.trim(),
      });
      setSession(user, token);
      handleSuccess('Cuenta creada con exito');
    } catch (error) {
      const message = errorMessageFrom(error, 'No se pudo completar el registro');
      setRegisterError(message);
      toast.error(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    try {
      // TODO: integrar con backend cuando este disponible
      toast.info('Si el email existe recibiras instrucciones para restablecer tu contrasena.');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      const message = errorMessageFrom(error, 'No se pudo procesar la solicitud');
      setForgotError(message);
      toast.error(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  if (showForgotPassword) {
    return (
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              className="pl-10"
              placeholder="tu@email.com"
              required
            />
          </div>
          {forgotError ? <p className="text-sm text-destructive">{forgotError}</p> : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={forgotLoading}>
            {forgotLoading ? 'Enviando...' : 'Enviar enlace'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowForgotPassword(false);
              setForgotError(null);
            }}
          >
            Volver
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value as 'login' | 'register')} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Iniciar sesion</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>

      <TabsContent value="login" className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(event) => setLoginData({ ...loginData, email: event.target.value })}
                className="pl-10"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(event) => setLoginData({ ...loginData, password: event.target.value })}
                className="pl-10 pr-10"
                placeholder="Tu contrasena"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
          </div>

          <div className="flex items-center justify-between text-sm">
            <Button variant="link" type="button" onClick={() => setShowForgotPassword(true)} className="h-auto p-0">
              Olvidaste tu contrasena?
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loginLoading}>
            {loginLoading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <Separator />

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </Button>
      </TabsContent>

      <TabsContent value="register" className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-firstname">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-firstname"
                type="text"
                value={registerData.firstName}
                onChange={(event) => setRegisterData({ ...registerData, firstName: event.target.value })}
                className="pl-10"
                placeholder="Tu nombre"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-lastname">Apellido</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-lastname"
                type="text"
                value={registerData.lastName}
                onChange={(event) => setRegisterData({ ...registerData, lastName: event.target.value })}
                className="pl-10"
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-email"
                type="email"
                value={registerData.email}
                onChange={(event) => setRegisterData({ ...registerData, email: event.target.value })}
                className="pl-10"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(event) => setRegisterData({ ...registerData, password: event.target.value })}
                className="pl-10 pr-10"
                placeholder="Crea una contrasena"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm">Confirmar contrasena</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                value={registerData.confirmPassword}
                onChange={(event) => setRegisterData({ ...registerData, confirmPassword: event.target.value })}
                className="pl-10"
                placeholder="Confirma tu contrasena"
                required
              />
            </div>
          </div>

          {registerError ? <p className="text-sm text-destructive">{registerError}</p> : null}

          <Button type="submit" className="w-full" disabled={registerLoading}>
            {registerLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <Separator />

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogleLogin}>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continuar con Google
        </Button>
      </TabsContent>
    </Tabs>
  );
}





