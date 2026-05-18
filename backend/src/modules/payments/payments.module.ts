import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentsController } from './payments.controller';
import { MpOAuthController } from './mp-oauth.controller';
import { OrdersModule } from '../orders/orders.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { EnvironmentVariables } from '../../config/config.configuration';

@Module({
  imports: [
    ConfigModule,
    OrdersModule,
    SiteSettingsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables>) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [MercadoPagoService],
  controllers: [PaymentsController, MpOAuthController],
})
export class PaymentsModule {}
