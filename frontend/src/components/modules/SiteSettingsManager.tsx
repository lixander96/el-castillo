import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';
import {
  API_URL,
  MercadoPagoStatus,
  SiteSettings,
  SiteSettingsResponse,
  UpdateSiteSettingsPayload,
  disconnectMp,
  fetchSiteSettings,
  startMpOAuth,
  updateSiteSettings,
  uploadFile,
} from '../../lib/api';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Loader2,
  Copy,
  Image as ImageIcon,
  Save,
  RefreshCw,
  Link2,
  Link2Off,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

type BrandField = keyof Pick<
  SiteSettings,
  | 'mpWebhookSecret'
  | 'logoLightUrl'
  | 'logoDarkUrl'
  | 'heroImageUrl'
  | 'faviconUrl'
  | 'siteName'
  | 'siteTagline'
  | 'paymentStatementDescriptor'
>;

type FormState = Record<BrandField, string>;

const initialForm: FormState = {
  mpWebhookSecret: '',
  logoLightUrl: '',
  logoDarkUrl: '',
  heroImageUrl: '',
  faviconUrl: '',
  siteName: '',
  siteTagline: '',
  paymentStatementDescriptor: '',
};

const settingsToForm = (s: SiteSettings): FormState => ({
  mpWebhookSecret: s.mpWebhookSecret ?? '',
  logoLightUrl: s.logoLightUrl ?? '',
  logoDarkUrl: s.logoDarkUrl ?? '',
  heroImageUrl: s.heroImageUrl ?? '',
  faviconUrl: s.faviconUrl ?? '',
  siteName: s.siteName ?? '',
  siteTagline: s.siteTagline ?? '',
  paymentStatementDescriptor: s.paymentStatementDescriptor ?? 'EL CASTILLO',
});

const buildPreview = (value: string): string | null => {
  if (!value) return null;
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = value.startsWith('/') ? value : `/${value}`;
  return `${base}${path}`;
};

const ImageField: React.FC<{
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, hint, value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const inputId = useMemo(() => `upload-${label.replace(/\s+/g, '-').toLowerCase()}`, [label]);
  const preview = buildPreview(value);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      onChange(uploaded.url || uploaded.path || '');
      toast.success(`${label} actualizado`);
    } catch (err) {
      toast.error(`No se pudo subir ${label}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className="flex items-start gap-3">
        <div className="h-20 w-20 rounded-md border border-dashed bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
          {preview ? (
            <img src={preview} alt={label} className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Input
            placeholder="URL de la imagen o subir abajo"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void handleFile(file);
                  e.target.value = '';
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById(inputId)?.click()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subir archivo'}
            </Button>
            {value && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange('')}
              >
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SiteSettingsManager: React.FC = () => {
  const { currentRole, refreshSiteSettings } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [mpStatus, setMpStatus] = useState<MercadoPagoStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data: SiteSettingsResponse = await fetchSiteSettings();
      setForm(settingsToForm(data.settings));
      setMpStatus(data.mpStatus);
    } catch (err) {
      toast.error('No se pudo cargar la configuracion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentRole === 'admin') {
      void load();
    }
  }, [currentRole, load]);

  useEffect(() => {
    const mp = searchParams.get('mp');
    if (!mp) return;
    if (mp === 'success') {
      toast.success('Mercado Pago conectado correctamente.');
    } else if (mp === 'error') {
      const detail = searchParams.get('mp_detail');
      toast.error(`No se pudo conectar Mercado Pago${detail ? `: ${detail}` : '.'}`);
    }
    const next = new URLSearchParams(searchParams);
    next.delete('mp');
    next.delete('mp_detail');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const setField = (field: BrandField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const webhookUrl = useMemo(() => {
    const apiBase = API_URL.startsWith('http')
      ? API_URL
      : `${window.location.origin}${API_URL.startsWith('/') ? API_URL : `/${API_URL}`}`;
    return `${apiBase.replace(/\/$/, '')}/mercadopago/webhook`;
  }, []);

  const copyWebhook = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      toast.success('URL del webhook copiada');
    } catch {
      toast.error('No se pudo copiar la URL');
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { url } = await startMpOAuth();
      window.location.assign(url);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'No se pudo iniciar el flujo OAuth de Mercado Pago.';
      toast.error(message);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const status = await disconnectMp();
      setMpStatus(status);
      toast.success('Mercado Pago desconectado.');
    } catch (err) {
      toast.error('No se pudo desconectar Mercado Pago.');
    } finally {
      setDisconnecting(false);
      setDisconnectOpen(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: UpdateSiteSettingsPayload = {
        mpWebhookSecret: form.mpWebhookSecret.trim() || null,
        logoLightUrl: form.logoLightUrl.trim() || null,
        logoDarkUrl: form.logoDarkUrl.trim() || null,
        heroImageUrl: form.heroImageUrl.trim() || null,
        faviconUrl: form.faviconUrl.trim() || null,
        siteName: form.siteName.trim() || null,
        siteTagline: form.siteTagline.trim() || null,
        paymentStatementDescriptor: form.paymentStatementDescriptor.trim() || 'EL CASTILLO',
      };
      const updated = await updateSiteSettings(payload);
      setForm(settingsToForm(updated));
      await refreshSiteSettings();
      toast.success('Configuracion guardada.');
    } catch (err) {
      toast.error('No se pudo guardar la configuracion.');
    } finally {
      setSaving(false);
    }
  };

  if (currentRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Configuracion</CardTitle>
            <CardDescription>Solo administradores pueden ver esta pagina.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const expiresLabel = mpStatus?.expiresAt
    ? new Date(mpStatus.expiresAt).toLocaleString('es-AR')
    : null;
  const connectedAtLabel = mpStatus?.connectedAt
    ? new Date(mpStatus.connectedAt).toLocaleString('es-AR')
    : null;

  return (
    <form className="container mx-auto px-4 py-8 max-w-4xl space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuracion del sitio</h1>
          <p className="text-sm text-muted-foreground">
            Marca, identidad visual y conexion con Mercado Pago.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => load()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Recargar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identidad del sitio</CardTitle>
          <CardDescription>Lo que ven los clientes en navegacion, footer y pestañas del navegador.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del sitio</Label>
              <Input
                value={form.siteName}
                onChange={(e) => setField('siteName', e.target.value)}
                placeholder="Mi Espacio Cultural"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline / bajada</Label>
              <Input
                value={form.siteTagline}
                onChange={(e) => setField('siteTagline', e.target.value)}
                placeholder="Centro Cultural y de Eventos"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageField
              label="Logo (tema claro)"
              hint="Se muestra cuando el sitio esta en modo claro."
              value={form.logoLightUrl}
              onChange={(v) => setField('logoLightUrl', v)}
            />
            <ImageField
              label="Logo (tema oscuro)"
              hint="Se muestra cuando el sitio esta en modo oscuro."
              value={form.logoDarkUrl}
              onChange={(v) => setField('logoDarkUrl', v)}
            />
            <ImageField
              label="Imagen hero"
              hint="Banner principal o imagen de portada."
              value={form.heroImageUrl}
              onChange={(v) => setField('heroImageUrl', v)}
            />
            <ImageField
              label="Favicon"
              hint="Icono que aparece en la pestaña del navegador."
              value={form.faviconUrl}
              onChange={(v) => setField('faviconUrl', v)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mercado Pago</CardTitle>
          <CardDescription>
            Conecta la cuenta de Mercado Pago (personal o de negocio) que va a recibir los pagos. El
            access token se obtiene y refresca automaticamente, no hace falta copiarlo a mano.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mpStatus?.connected ? (
            <div className="rounded-md border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Cuenta conectada</span>
                {mpStatus.liveMode === true && <Badge variant="default">Live</Badge>}
                {mpStatus.liveMode === false && <Badge variant="secondary">Sandbox</Badge>}
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                {mpStatus.userId && (
                  <div>
                    User ID de MP: <span className="font-mono">{mpStatus.userId}</span>
                  </div>
                )}
                {connectedAtLabel && <div>Conectada el {connectedAtLabel}.</div>}
                {expiresLabel && <div>Token vigente hasta {expiresLabel} (se renueva solo).</div>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Reconectar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setDisconnectOpen(true)}
                  disabled={disconnecting}
                >
                  <Link2Off className="h-4 w-4 mr-2" /> Desconectar
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">Cuenta no conectada</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hasta que conectes Mercado Pago, los pagos van a fallar con un error 503. Vas a ser
                redirigido a Mercado Pago para iniciar sesion con la cuenta que recibe los pagos.
              </p>
              <Button type="button" onClick={handleConnect} disabled={connecting}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                Conectar con Mercado Pago
              </Button>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label>URL del webhook para configurar en MP</Label>
            <div className="flex items-center gap-2">
              <Input value={webhookUrl} readOnly className="font-mono text-sm" />
              <Button type="button" variant="outline" size="sm" onClick={copyWebhook}>
                <Copy className="h-4 w-4 mr-2" /> Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Pegala en MP &rarr; Tus integraciones &rarr; tu app &rarr; Webhooks, suscribite al
              evento <code>payment</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Webhook secret (opcional)</Label>
            <Input
              value={form.mpWebhookSecret}
              onChange={(e) => setField('mpWebhookSecret', e.target.value)}
              placeholder="Solo necesario si configuras firma del webhook"
              autoComplete="off"
              spellCheck={false}
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label>Texto en el resumen de la tarjeta</Label>
            <Input
              value={form.paymentStatementDescriptor}
              onChange={(e) => setField('paymentStatementDescriptor', e.target.value)}
              placeholder="EL CASTILLO"
              maxLength={40}
            />
            <p className="text-xs text-muted-foreground">
              Aparece en el resumen de tarjeta del comprador (max 40 caracteres).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar cambios
        </Button>
      </div>

      <AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar Mercado Pago</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a borrar el token de MP de la plataforma. Los pagos van a fallar hasta que vuelvas
              a conectar la cuenta. ¿Continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnecting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void handleDisconnect(); }} disabled={disconnecting}>
              {disconnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};

export default SiteSettingsManager;
