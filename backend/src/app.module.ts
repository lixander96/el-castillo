import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { MailerModule } from './mailer/mailer.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { PaymentsModule } from './modules/payments/payments.module';
import { EventsModule } from './modules/events/events.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    EventsModule,
    CouponsModule,
    OrdersModule,
    PaymentsModule,
    // Archivos subidos: servidos bajo /api/uploads (coincide con BACKEND_URL
    // que termina en /api). Va antes que la SPA por ser mas especifico.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/api/uploads',
    }),
    // SPA (build del frontend copiado a /app/client). Catch-all que sirve
    // index.html para las rutas del cliente; excluye /api para no pisar la API.
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'client'),
      exclude: ['/api/(.*)'],
    }),
    MailerModule,
    WhatsappModule,
    UploadsModule,
    SiteSettingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  static port: number | string;
  static ssl_certificate_path: string | undefined;
  static ssl_key_path: string | undefined;

  constructor(private readonly _configService: ConfigService) {
    AppModule.port = this._configService.get('PORT');
    AppModule.ssl_certificate_path = this._configService.get('SSL_CERTIFICATE');
    AppModule.ssl_key_path = this._configService.get('SSL_KEY');
  }
}
