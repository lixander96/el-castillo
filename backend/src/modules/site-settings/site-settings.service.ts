import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { SiteSettings } from './entities/site-settings.entity';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { EnvironmentVariables } from '../../config/config.configuration';

export interface PublicSiteSettings {
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  heroImageUrl: string | null;
  faviconUrl: string | null;
  siteName: string | null;
  siteTagline: string | null;
}

export interface MercadoPagoStatus {
  connected: boolean;
  liveMode: boolean | null;
  userId: string | null;
  email: string | null;
  nickname: string | null;
  expiresAt: string | null;
  connectedAt: string | null;
  scope: string | null;
}

const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token';
const MP_AUTH_URL = 'https://auth.mercadopago.com/authorization';
const MP_ME_URL = 'https://api.mercadopago.com/users/me';
const REFRESH_BUFFER_SECONDS = 300;

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly repo: Repository<SiteSettings>,
    private readonly config: ConfigService<EnvironmentVariables>,
  ) {}

  async getOrCreate(): Promise<SiteSettings> {
    const existing = await this.repo.findOne({ where: {}, order: { createdAt: 'ASC' } });
    if (existing) return existing;
    const created = this.repo.create({
      paymentStatementDescriptor: 'EL CASTILLO',
    });
    return this.repo.save(created);
  }

  async getPublic(): Promise<PublicSiteSettings> {
    const settings = await this.getOrCreate();
    return {
      logoLightUrl: settings.logoLightUrl,
      logoDarkUrl: settings.logoDarkUrl,
      heroImageUrl: settings.heroImageUrl,
      faviconUrl: settings.faviconUrl,
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
    };
  }

  async getMpStatus(): Promise<MercadoPagoStatus> {
    const settings = await this.getOrCreate();
    return {
      connected: !!settings.mpAccessToken,
      liveMode: settings.mpLiveMode,
      userId: settings.mpUserId,
      email: settings.mpEmail,
      nickname: settings.mpNickname,
      expiresAt: settings.mpTokenExpiresAt?.toISOString() ?? null,
      connectedAt: settings.mpConnectedAt?.toISOString() ?? null,
      scope: settings.mpScope,
    };
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettings> {
    const current = await this.getOrCreate();
    Object.assign(current, dto);
    return this.repo.save(current);
  }

  oauthIsConfigured(): boolean {
    const clientId = (this.config.get('MP_OAUTH_CLIENT_ID') || '').trim();
    const clientSecret = (this.config.get('MP_OAUTH_CLIENT_SECRET') || '').trim();
    return clientId.length > 0 && clientSecret.length > 0;
  }

  buildAuthorizationUrl(state: string): string {
    const { clientId, redirectUri } = this.requireOAuthCredentials();
    const url = new URL(MP_AUTH_URL);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('platform_id', 'mp');
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', redirectUri);
    return url.toString();
  }

  async exchangeCode(code: string): Promise<SiteSettings> {
    const { clientId, clientSecret, redirectUri } = this.requireOAuthCredentials();

    let response;
    try {
      response = await axios.post(
        MP_TOKEN_URL,
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: 15000,
        },
      );
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message ?? 'unknown';
      throw new BadRequestException(`Mercado Pago rechazo el codigo: ${JSON.stringify(detail)}`);
    }

    const saved = await this.persistTokenResponse(response.data);
    await this.fetchAndStoreUserInfo(saved);
    return this.repo.findOne({ where: { id: saved.id } }) as Promise<SiteSettings>;
  }

  async disconnect(): Promise<SiteSettings> {
    const settings = await this.getOrCreate();
    settings.mpAccessToken = null;
    settings.mpRefreshToken = null;
    settings.mpPublicKey = null;
    settings.mpUserId = null;
    settings.mpEmail = null;
    settings.mpNickname = null;
    settings.mpLiveMode = null;
    settings.mpScope = null;
    settings.mpTokenExpiresAt = null;
    settings.mpConnectedAt = null;
    return this.repo.save(settings);
  }

  async getStatementDescriptor(): Promise<string> {
    const settings = await this.getOrCreate();
    return settings.paymentStatementDescriptor || 'EL CASTILLO';
  }

  async getMpUserId(): Promise<string | null> {
    const settings = await this.getOrCreate();
    return settings.mpUserId;
  }

  async buildMpClient() {
    const token = await this.getValidAccessToken();
    const client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 10000 },
    });
    return {
      client,
      preference: new Preference(client),
      payment: new Payment(client),
    };
  }

  getRedirectUri(): string {
    return (
      this.config.get('MP_OAUTH_REDIRECT_URI') ||
      `${(this.config.get('BACKEND_URL') || '').replace(/\/$/, '')}/payments/mp/oauth/callback`
    );
  }

  private async getValidAccessToken(): Promise<string> {
    const settings = await this.getOrCreate();
    if (!settings.mpAccessToken) {
      throw new ServiceUnavailableException(
        'Mercado Pago no esta conectado. Conecta la cuenta desde /configuracion.',
      );
    }

    const expiresAt = settings.mpTokenExpiresAt?.getTime();
    const isExpiringSoon =
      typeof expiresAt === 'number' && expiresAt - Date.now() < REFRESH_BUFFER_SECONDS * 1000;

    if (isExpiringSoon && settings.mpRefreshToken) {
      const refreshed = await this.refreshAccessToken(settings);
      return refreshed.mpAccessToken as string;
    }

    return settings.mpAccessToken;
  }

  private async refreshAccessToken(settings: SiteSettings): Promise<SiteSettings> {
    const { clientId, clientSecret } = this.requireOAuthCredentials();

    if (!settings.mpRefreshToken) {
      throw new ServiceUnavailableException(
        'No hay refresh token de Mercado Pago disponible. Reconecta la cuenta.',
      );
    }

    let response;
    try {
      response = await axios.post(
        MP_TOKEN_URL,
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'refresh_token',
          refresh_token: settings.mpRefreshToken,
        },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: 15000,
        },
      );
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message ?? 'unknown';
      throw new InternalServerErrorException(
        `Mercado Pago rechazo el refresh token: ${JSON.stringify(detail)}`,
      );
    }

    return this.persistTokenResponse(response.data, settings);
  }

  private async persistTokenResponse(data: any, existing?: SiteSettings): Promise<SiteSettings> {
    const settings = existing ?? (await this.getOrCreate());
    const expiresInSec = Number(data?.expires_in);
    settings.mpAccessToken = data?.access_token ?? settings.mpAccessToken;
    settings.mpRefreshToken = data?.refresh_token ?? settings.mpRefreshToken;
    settings.mpPublicKey = data?.public_key ?? settings.mpPublicKey;
    settings.mpUserId = data?.user_id != null ? String(data.user_id) : settings.mpUserId;
    settings.mpLiveMode = typeof data?.live_mode === 'boolean' ? data.live_mode : settings.mpLiveMode;
    settings.mpScope = data?.scope ?? settings.mpScope;
    settings.mpTokenExpiresAt = Number.isFinite(expiresInSec)
      ? new Date(Date.now() + expiresInSec * 1000)
      : settings.mpTokenExpiresAt;
    settings.mpConnectedAt = settings.mpConnectedAt ?? new Date();
    return this.repo.save(settings);
  }

  private async fetchAndStoreUserInfo(settings: SiteSettings): Promise<void> {
    if (!settings.mpAccessToken) return;
    try {
      const { data } = await axios.get(MP_ME_URL, {
        headers: { Authorization: `Bearer ${settings.mpAccessToken}` },
        timeout: 10000,
      });
      settings.mpEmail = data?.email ?? settings.mpEmail;
      settings.mpNickname = data?.nickname ?? settings.mpNickname;
      if (data?.id != null) settings.mpUserId = String(data.id);
      await this.repo.save(settings);
    } catch (err) {
      // No bloqueamos la conexion si el users/me falla; el resto del token es valido.
      console.warn('No se pudo obtener email/nickname de MP /users/me:', err?.message ?? err);
    }
  }

  private requireOAuthCredentials(): {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  } {
    const clientId = (this.config.get('MP_OAUTH_CLIENT_ID') || '').trim();
    const clientSecret = (this.config.get('MP_OAUTH_CLIENT_SECRET') || '').trim();
    if (!clientId || !clientSecret) {
      throw new ServiceUnavailableException(
        'La plataforma todavia no tiene configurada su app OAuth de Mercado Pago. Avisa al operador.',
      );
    }
    return { clientId, clientSecret, redirectUri: this.getRedirectUri() };
  }
}
