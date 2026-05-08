import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepo: Repository<Event>,
    @InjectRepository(TicketType) private readonly ticketRepo: Repository<TicketType>,
  ) { }

  async findAll() {
    const events = await this.eventsRepo.find({ order: { date: 'ASC', time: 'ASC' } });
    await this.hydrateSalesData(events);
    return events;
  }

  async findOne(id: string) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.hydrateSalesData([event]);
    return event;
  }

  async create(dto: CreateEventDto) {
    const event = await this.eventsRepo.save({
      ...dto,
      ticketTypes: dto.ticketTypes.map(t =>
        this.ticketRepo.create({
          ...t,
          sold: 0,
          available: Number(t.total) - 0,
        })
      ),
    });
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    // Update scalars
    this.eventsRepo.merge(event, dto);
    // Replace ticketTypes if provided
    if (dto.ticketTypes) {
      event.ticketTypes = []
      for (const ticketTypeDto of dto.ticketTypes) {

        if (ticketTypeDto.id) {
          const exist = await this.ticketRepo.findOneBy({ id: ticketTypeDto.id })
          if (!exist)
            throw new BadRequestException(`Not exist ticketType with id: ${ticketTypeDto.id}`)

          const merged = this.ticketRepo.merge(
            exist, ticketTypeDto, { available: Number(ticketTypeDto.total) - ticketTypeDto.sold }
          )
          const ticketType = await this.ticketRepo.save(merged)
          event.ticketTypes = [...event.ticketTypes, ticketType]
        }
        else {
          const ticketType = this.ticketRepo.create({
            ...ticketTypeDto,
            sold: 0,
            available: Number(ticketTypeDto.total) - 0,
            event,
          })
          event.ticketTypes = [...event.ticketTypes, ticketType]
        }
      }
    }
    return this.eventsRepo.save(event);
  }

  async remove(id: string) {
    await this.eventsRepo.delete(id);
    return { ok: true };
  }

  private async hydrateSalesData(events: Event[]) {
    const allTicketTypes = events.flatMap(e => e.ticketTypes || []);
    if (!allTicketTypes.length) return;
    const ids = allTicketTypes.map(t => t.id);
    const rows = await this.ticketRepo.manager
      .getRepository(OrderItem)
      .createQueryBuilder('item')
      .innerJoin('item.order', 'o')
      .innerJoin('item.ticketType', 'tt')
      .where('o.status = :status', { status: 'approved' })
      .andWhere('tt.id IN (:...ids)', { ids })
      .select('tt.id', 'ticketTypeId')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'sold')
      .groupBy('tt.id')
      .getRawMany();
    const soldMap = new Map<string, number>(rows.map(r => [String(r.ticketTypeId ?? r.tt_id ?? r.id), Number(r.sold ?? 0)]));
    for (const ev of events) {
      let totalSoldForEvent = 0;
      for (const tt of ev.ticketTypes || []) {
        const sold = soldMap.get(String(tt.id)) || 0;
        tt.sold = sold;
        tt.available = Math.max(0, Number(tt.total) - sold);
        totalSoldForEvent += sold;
      }
      if (typeof (ev as any).ticketsSold === 'number') {
        (ev as any).ticketsSold = totalSoldForEvent;
      }
    }
  }
}
