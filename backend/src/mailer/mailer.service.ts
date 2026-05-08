import { Inject, Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { SendEmailDto } from './mail.interface';
import Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/config.configuration';

@Injectable()
export class MailerService {

  constructor(
    private _configService: ConfigService<EnvironmentVariables>
  ) { }

  private mailTransport() {
    const transporter = createTransport({
      host: this._configService.get('MAILER_HOST'),
      port: +this._configService.get('MAILER_PORT'),
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: this._configService.get('MAILER_USER'),
        pass: this._configService.get('MAILER_PASS'),
      },
    });
    return transporter;
  }

  async send(dto: SendEmailDto) {
    const { recipients, subject, html, text, attachments } = dto;
    const transport = this.mailTransport();
    const fromAddress = this._configService.get('MAILER_USER') || undefined;
    const sender: Mail.Options['from'] = fromAddress
      ? {
          address: fromAddress,
          name: 'El Castillo Barracas',
        }
      : undefined;
    const to = recipients.length === 1 ? recipients[0] : recipients;
    const options: Mail.Options = {
      from: sender,
      to,
      subject,
      html,
      text,
      attachments,
    };

    try {
      return await transport.sendMail(options);
    } catch (error) {
      console.error('Error: ', error);
    }
  }
}
