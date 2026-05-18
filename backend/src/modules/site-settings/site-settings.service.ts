import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { SiteSettings } from './entities/site-settings.entity';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

export interface PublicSiteSettings {
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  heroImageUrl: string | null;
  faviconUrl: string | null;
  siteName: string | null;
  siteTagline: string | null;
}

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly repo: Repository<SiteSettings>,
  ) {}

  async getOrCreate(): Promise<SiteSettings> {
    const existing = await this.repo.findOne({ where: {}, order: { createdAt: 'ASC' } });
    if (existing) return existing;
    const created = this.repo.create({
      mpAccessToken: null,
      mpWebhookSecret: null,
      logoLightUrl: null,
      logoDarkUrl: null,
      heroImageUrl: null,
      faviconUrl: null,
      siteName: null,
      siteTagline: null,
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

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettings> {
    const current = await this.getOrCreate();
    Object.assign(current, dto);
    return this.repo.save(current);
  }

  async getMpAccessToken(): Promise<string> {
    const settings = await this.getOrCreate();
    if (!settings.mpAccessToken) {
      throw new ServiceUnavailableException(
        'Mercado Pago no esta configurado. Definir el access token desde /configuracion (admin).',
      );
    }
    return settings.mpAccessToken;
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
    const token = await this.getMpAccessToken();
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
}
