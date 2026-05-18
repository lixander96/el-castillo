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
  expiresAt: string | null;
  connectedAt: string | null;
  scope: string | null;
}

const MP_TOKEN_URL = 'https://api.mercadopago.com/oauth/token';
const MP_AUTH_URL = 'https://auth.mercadopago.com/authorization';
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

  buildAuthorizationUrl(state: string): string {
    const clientId = this.requireOAuthClientId();
    const redirectUri = this.getRedirectUri();
    const url = new URL(MP_AUTH_URL);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('platform_id', 'mp');
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', redirectUri);
    return url.toString();
  }

  async exchangeCode(code: string): Promise<SiteSettings> {
    const clientId = this.requireOAuthClientId();
    const clientSecret = this.requireOAuthClientSecret();
    const redirectUri = this.getRedirectUri();

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

    return this.persistTokenResponse(response.data);
  }

  async disconnect(): Promise<SiteSettings> {
    const settings = await this.getOrCreate();
    settings.mpAccessToken = null;
    settings.mpRefreshToken = null;
    settings.mpPublicKey = null;
    settings.mpUserId = null;
    settings.mpLiveMode = null;
    settings.mpScope = null;
    settings.mpTokenExpiresAt = null;
    settings.mpConnectedAt = null;
    return this.repo.save(settings);
  }

  async getMpWebhookSecret(): Promise<string | null> {
    const settings = await this.getOrCreate();
    return settings.mpWebhookSecret;
  }

  async getStatementDescriptor(): Promise<string> {
    const settings = await this.getOrCreate();
    return settings.paymentStatementDescriptor || 'EL CASTILLO';
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

  private async getValidAccessToken(): Promise<string> {
    const settings = await this.getOrCreate();
    if (!settings.mpAccessToken) {
      throw new ServiceUnavailableException(
        'Mercado Pago no esta conectado. Un administrador debe conectar la cuenta desde /configuracion.',
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
    const clientId = this.requireOAuthClientId();
    const clientSecret = this.requireOAuthClientSecret();

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

  private requireOAuthClientId(): string {
    const v = this.config.get('MP_OAUTH_CLIENT_ID');
    if (!v) {
      throw new ServiceUnavailableException(
        'MP_OAUTH_CLIENT_ID no esta configurado en el .env del backend.',
      );
    }
    return v;
  }

  private requireOAuthClientSecret(): string {
    const v = this.config.get('MP_OAUTH_CLIENT_SECRET');
    if (!v) {
      throw new ServiceUnavailableException(
        'MP_OAUTH_CLIENT_SECRET no esta configurado en el .env del backend.',
      );
    }
    return v;
  }

  getRedirectUri(): string {
    return (
      this.config.get('MP_OAUTH_REDIRECT_URI') ||
      `${this.config.get('BACKEND_URL') || ''}/payments/mp/oauth/callback`
    );
  }
}
