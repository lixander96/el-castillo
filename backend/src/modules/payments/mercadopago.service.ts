import { Injectable } from '@nestjs/common';
import { SiteSettingsService } from '../site-settings/site-settings.service';

@Injectable()
export class MercadoPagoService {
  constructor(private readonly settings: SiteSettingsService) {}

  async getPreference() {
    const { preference } = await this.settings.buildMpClient();
    return preference;
  }

  async getPayment() {
    const { payment } = await this.settings.buildMpClient();
    return payment;
  }

  async getStatementDescriptor() {
    return this.settings.getStatementDescriptor();
  }

  async getWebhookSecret() {
    return this.settings.getMpWebhookSecret();
  }
}
