import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const slugify = (value: string) =>
  (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventsRepo: Repository<Event>,
    @InjectRepository(TicketType) private readonly ticketRepo: Repository<TicketType>,
  ) { }

  async findAll() {
    const events = await this.eventsRepo.find({ order: { date: 'DESC', time: 'DESC' } });
    await this.hydrateSalesData(events);
    return events;
  }

  async findOne(id: string) {
    const event = await this.eventsRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    await this.hydrateSalesData([event]);
    return event;
  }

  async findBySlug(slug: string) {
    const event = await this.eventsRepo.findOne({ where: { slug } });
    if (!event) throw new NotFoundException('Event not found');
    await this.hydrateSalesData([event]);
    return event;
  }

  async create(dto: CreateEventDto) {
    const slug = await this.generateUniqueSlug(dto.title);
    const event = await this.eventsRepo.save({
      ...dto,
      slug,
      ticketTypes: dto.ticketTypes.map(t =>
        this.ticketRepo.create({
          ...t,
          sold: 0,
          manualSold: Number(t.manualSold ?? 0),
          available: Math.max(0, Number(t.total) - Number(t.manualSold ?? 0)),
        })
      ),
    });
    await this.hydrateSalesData([event]);
    return event;
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    const { ticketTypes, ...scalarDto } = dto;

    const merged: any = { ...scalarDto };
    if (scalarDto.title && scalarDto.title !== event.title) {
      merged.slug = await this.generateUniqueSlug(scalarDto.title, id);
    }

    this.eventsRepo.merge(event, merged);

    if (ticketTypes) {
      event.ticketTypes = [];
      for (const ticketTypeDto of ticketTypes) {
        const total = Number(ticketTypeDto.total ?? 0);
        const manualSold = Number(ticketTypeDto.manualSold ?? 0);

        if (ticketTypeDto.id) {
          const exist = await this.ticketRepo.findOneBy({ id: ticketTypeDto.id })
          if (!exist)
            throw new BadRequestException(`Not exist ticketType with id: ${ticketTypeDto.id}`)

          const { sold, available, ...safeDto } = ticketTypeDto as any;
          const merged = this.ticketRepo.merge(
            exist,
            safeDto,
            { manualSold, available: Math.max(0, total - manualSold - Number(exist.sold ?? 0)) }
          )
          const ticketType = await this.ticketRepo.save(merged)
          event.ticketTypes = [...event.ticketTypes, ticketType]
        } else {
          const ticketType = this.ticketRepo.create({
            ...ticketTypeDto,
            sold: 0,
            manualSold,
            available: Math.max(0, total - manualSold),
            event,
          })
          event.ticketTypes = [...event.ticketTypes, ticketType]
        }
      }
    }
    const saved = await this.eventsRepo.save(event);
    await this.hydrateSalesData([saved]);
    return saved;
  }

  async remove(id: string) {
    await this.eventsRepo.delete(id);
    return { ok: true };
  }

  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'evento';
    let candidate = base;
    let counter = 2;
    while (true) {
      const where: any = { slug: candidate };
      const conflict = await this.eventsRepo.findOne({ where });
      if (!conflict || conflict.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${counter}`;
      counter += 1;
      if (counter > 1000) {
        return `${base}-${Date.now()}`;
      }
    }
  }

  private async hydrateSalesData(events: Event[]) {
    const allTicketTypes = events.flatMap(e => e.ticketTypes || []);
    if (!allTicketTypes.length) {
      // even when no ticket types, ensure slug exists for legacy events
      for (const ev of events) {
        if (!ev.slug) {
          ev.slug = await this.generateUniqueSlug(ev.title, ev.id);
          await this.eventsRepo.update({ id: ev.id }, { slug: ev.slug });
        }
      }
      return;
    }
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
    const orderSoldMap = new Map<string, number>(rows.map(r => [String(r.ticketTypeId ?? r.tt_id ?? r.id), Number(r.sold ?? 0)]));
    for (const ev of events) {
      if (!ev.slug) {
        ev.slug = await this.generateUniqueSlug(ev.title, ev.id);
        await this.eventsRepo.update({ id: ev.id }, { slug: ev.slug });
      }
      let totalSoldForEvent = 0;
      for (const tt of ev.ticketTypes || []) {
        const orderSold = orderSoldMap.get(String(tt.id)) || 0;
        const manualSold = Number(tt.manualSold ?? 0);
        const computedSold = orderSold + manualSold;
        tt.sold = computedSold;
        tt.available = Math.max(0, Number(tt.total) - computedSold);
        totalSoldForEvent += computedSold;
      }
      if (typeof (ev as any).ticketsSold === 'number') {
        (ev as any).ticketsSold = totalSoldForEvent;
      }
    }
  }
}
