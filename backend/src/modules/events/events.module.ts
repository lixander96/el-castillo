import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { OgController } from './og.controller';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, TicketType])],
  controllers: [EventsController, OgController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
