import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { SendTextMessageDto } from './dto/send-text-message.dto';
import { SendMenuMessageDto } from './dto/send-menu-message.dto';
import { SendImageMessageDto } from './dto/send-image-message.dto';
import { EnvironmentVariables } from '../config/config.configuration';

@Injectable()
export class WhatsappService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    const phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID');
    this.token = this.configService.get<string>('WHATSAPP_TOKEN');
    this.apiUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    this.baseUrl = this.configService.get<string>('BASE_PUBLIC_URL') || 'http://localhost:3000';
  }

  async sendTextMessage(dto: SendTextMessageDto): Promise<void> {
    const body = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'text',
      text: { body: dto.message },
    };

    await this.sendRequest(body);
  }

  async sendMenuMessage(dto: SendMenuMessageDto): Promise<void> {
    const body = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: dto.message,
        },
        action: {
          buttons: dto.buttons.map((btn) => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title,
            },
          })),
        },
      },
    };

    await this.sendRequest(body);
  }

  // Nuevo método
  async sendImageMessage(dto: SendImageMessageDto): Promise<void> {
    const imageUrl = `${this.baseUrl}/files/${dto.imageName}`;

    const body = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: dto.caption || '',
      },
    };

    await this.sendRequest(body);
  }

  private async sendRequest(payload: any): Promise<void> {
    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    try {
      await firstValueFrom(this.http.post(this.apiUrl, payload, { headers }));
    } catch (error) {
      console.error('Error al enviar mensaje de WhatsApp:', error.response?.data || error.message);
    }
  }
}
