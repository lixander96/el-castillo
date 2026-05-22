import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Event } from '../events/entities/event.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { Ticket } from './entities/ticket.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MailerModule } from '../../mailer/mailer.module';
import { TicketPdfService } from './ticket-pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Event, TicketType, Ticket, Coupon]), MailerModule, ConfigModule],
  controllers: [OrdersController, TicketsController],
  providers: [OrdersService, TicketsService, TicketPdfService],
  exports: [OrdersService, TicketsService],
})
export class OrdersModule {}
