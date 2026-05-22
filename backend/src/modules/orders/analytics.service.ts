import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Event } from '../events/entities/event.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { Coupon } from '../coupons/entities/coupon.entity';

type AnalyticsRange = {
  from?: string;
  to?: string;
  eventId?: string;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    @InjectRepository(Event) private readonly eventsRepo: Repository<Event>,
    @InjectRepository(TicketType) private readonly ticketsRepo: Repository<TicketType>,
    @InjectRepository(Coupon) private readonly couponsRepo: Repository<Coupon>,
  ) {}

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  private toNumber(value: unknown): number {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }

  async getOverview(range: AnalyticsRange) {
    const from = this.parseDate(range.from);
    const to = this.parseDate(range.to);

    const ordersQb = this.ordersRepo
      .createQueryBuilder('o')
      .leftJoin('o.items', 'item')
      .leftJoin('item.event', 'event')
      .where('o.status = :status', { status: 'approved' });

    if (from) ordersQb.andWhere('o.createdAt >= :from', { from });
    if (to) ordersQb.andWhere('o.createdAt <= :to', { to });
    if (range.eventId) ordersQb.andWhere('event.id = :eventId', { eventId: range.eventId });

    const row = await ordersQb
      .select('COUNT(DISTINCT o.id)', 'ordersCount')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'totalRevenue')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'ticketsSold')
      .getRawOne<{ ordersCount: string; totalRevenue: string; ticketsSold: string }>();

    const ordersCount = Number(row?.ordersCount ?? 0);
    const totalRevenue = this.toNumber(row?.totalRevenue);
    const ticketsSold = Number(row?.ticketsSold ?? 0);
    const averageTicket = ordersCount > 0 ? this.toNumber(totalRevenue / ordersCount) : 0;

    // Ocupacion: si hay eventId puntual, mostrar % del evento; si no, promedio ponderado
    let occupancyPct = 0;
    let totalCapacity = 0;
    let totalManualSold = 0;
    if (range.eventId) {
      const ev = await this.eventsRepo.findOne({ where: { id: range.eventId } });
      if (ev) {
        for (const tt of ev.ticketTypes || []) {
          totalCapacity += Number(tt.total ?? 0);
          totalManualSold += Number(tt.manualSold ?? 0);
        }
      }
    } else {
      const events = await this.eventsRepo.find();
      for (const ev of events) {
        for (const tt of ev.ticketTypes || []) {
          totalCapacity += Number(tt.total ?? 0);
          totalManualSold += Number(tt.manualSold ?? 0);
        }
      }
    }
    const totalOccupied = ticketsSold + totalManualSold;
    occupancyPct = totalCapacity > 0 ? this.toNumber((totalOccupied / totalCapacity) * 100) : 0;

    return {
      totalRevenue,
      ticketsSold,
      ordersCount,
      averageTicket,
      occupancyPct,
      totalCapacity,
      totalOccupied,
    };
  }

  async getDailySales(range: AnalyticsRange) {
    const from = this.parseDate(range.from);
    const to = this.parseDate(range.to);

    const qb = this.ordersRepo
      .createQueryBuilder('o')
      .leftJoin('o.items', 'item')
      .leftJoin('item.event', 'event')
      .where('o.status = :status', { status: 'approved' });

    if (from) qb.andWhere('o.createdAt >= :from', { from });
    if (to) qb.andWhere('o.createdAt <= :to', { to });
    if (range.eventId) qb.andWhere('event.id = :eventId', { eventId: range.eventId });

    const rows = await qb
      .select(`TO_CHAR(o."createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')`, 'day')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'ticketsSold')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'revenue')
      .addSelect('COUNT(DISTINCT o.id)', 'orders')
      .groupBy('day')
      .orderBy('day', 'ASC')
      .getRawMany<{ day: string; ticketsSold: string; revenue: string; orders: string }>();

    return rows.map((r) => ({
      day: r.day,
      ticketsSold: Number(r.ticketsSold ?? 0),
      revenue: this.toNumber(r.revenue),
      orders: Number(r.orders ?? 0),
    }));
  }

  async getPromoterBreakdown(range: AnalyticsRange) {
    const from = this.parseDate(range.from);
    const to = this.parseDate(range.to);

    const qb = this.couponsRepo
      .createQueryBuilder('c')
      .leftJoin('c.promoter', 'p')
      .leftJoin('c.orders', 'o', `o.status = 'approved'`)
      .leftJoin('o.items', 'item');

    if (from) qb.andWhere('(o."createdAt" IS NULL OR o."createdAt" >= :from)', { from });
    if (to) qb.andWhere('(o."createdAt" IS NULL OR o."createdAt" <= :to)', { to });
    if (range.eventId) {
      qb.leftJoin('item.event', 'event');
      qb.andWhere('(event.id IS NULL OR event.id = :eventId)', { eventId: range.eventId });
    }

    const rows = await qb
      .select('c.id', 'couponId')
      .addSelect('c.code', 'code')
      .addSelect('c.type', 'type')
      .addSelect('c.value', 'value')
      .addSelect('c."commissionRate"', 'commissionRate')
      .addSelect('p.id', 'promoterId')
      .addSelect('p."firstName"', 'promoterFirstName')
      .addSelect('p."lastName"', 'promoterLastName')
      .addSelect('p.email', 'promoterEmail')
      .addSelect('COUNT(DISTINCT o.id)', 'ordersCount')
      .addSelect('COALESCE(SUM(item.quantity), 0)', 'ticketsSold')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'netRevenue')
      .addSelect('COALESCE(SUM(o."discountAmount"), 0)', 'discountGiven')
      .groupBy('c.id')
      .addGroupBy('p.id')
      .orderBy('"ticketsSold"', 'DESC')
      .getRawMany();

    return rows.map((r) => {
      const ticketsSold = Number(r.ticketsSold ?? 0);
      const netRevenue = this.toNumber(r.netRevenue);
      const commissionRate = Number(r.commissionRate ?? 0);
      const commission = commissionRate > 0 ? this.toNumber(netRevenue * (commissionRate / 100)) : 0;
      return {
        couponId: r.couponId,
        code: r.code,
        type: r.type,
        value: Number(r.value ?? 0),
        commissionRate,
        promoter: r.promoterId
          ? {
              id: Number(r.promoterId),
              name: `${r.promoterFirstName ?? ''} ${r.promoterLastName ?? ''}`.trim() || r.promoterEmail,
              email: r.promoterEmail,
            }
          : null,
        ordersCount: Number(r.ordersCount ?? 0),
        ticketsSold,
        netRevenue,
        discountGiven: this.toNumber(r.discountGiven),
        commission,
      };
    });
  }

  async getEventOptions() {
    const events = await this.eventsRepo.find({ order: { date: 'DESC' } });
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
    }));
  }
}
