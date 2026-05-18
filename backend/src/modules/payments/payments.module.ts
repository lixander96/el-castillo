import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { PaymentsController } from './payments.controller';
import { OrdersModule } from '../orders/orders.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [OrdersModule, SiteSettingsModule],
  providers: [MercadoPagoService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
