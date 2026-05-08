import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Coupon, CouponType } from './entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { User, Role } from '../user/entities/user.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { Event } from '../events/entities/event.entity';

const METRIC_STATUSES: OrderStatus[] = ['approved'];

type ListCouponsOptions = {
  promoterId?: number | null;
  onlyActive?: boolean;
};

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepo: Repository<Coupon>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
  ) { }

  async findAll(options: ListCouponsOptions = {}) {
    const qb = this.couponsRepo
      .createQueryBuilder('coupon')
      .leftJoinAndSelect('coupon.promoter', 'promoter')
      .leftJoinAndSelect('coupon.allowedEvents', 'allowedEvent')
      .orderBy('coupon.createdAt', 'DESC');

    if (options.onlyActive) {
      qb.andWhere('coupon.isActive = :active', { active: true });
    }

    if (options.promoterId) {
      qb.andWhere('promoter.id = :promoterId', { promoterId: options.promoterId });
    }

    return qb.getMany();
  }

  async findById(id: string) {
    const coupon = await this.couponsRepo.findOne({
      where: { id },
      relations: ['promoter', 'allowedEvents'],
    });
    if (!coupon) {
      throw new NotFoundException('Cupon no encontrado');
    }
    return coupon;
  }

  async findByCode(code: string, options: { onlyActive?: boolean } = {}) {
    if (!code) return null;
    const normalized = code.trim().toUpperCase();
    const where: FindOptionsWhere<Coupon> = { code: normalized };
    if (options.onlyActive) {
      where.isActive = true;
    }
    return this.couponsRepo.findOne({
      where,
      relations: ['promoter', 'allowedEvents'],
    });
  }

  async create(dto: CreateCouponDto) {
    const code = dto.code?.trim().toUpperCase();
    if (!code) {
      throw new BadRequestException('El codigo del cupon es obligatorio');
    }

    const existing = await this.couponsRepo.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException('Ya existe un cupon con ese codigo');
    }

    const promoter = await this.resolvePromoter(dto.promoterId);
    const allowedEvents = await this.loadAllowedEvents(dto.eventIds);

    const coupon = this.couponsRepo.create({
      code,
      description: dto.description ?? null,
      type: dto.type,
      value: dto.type === CouponType.FREE ? 0 : Number(dto.value ?? 0),
      isActive: dto.isActive ?? true,
      maxRedemptions: dto.maxRedemptions ?? null,
      promoter,
      commissionRate:
        promoter && dto.commissionRate !== undefined ? Number(dto.commissionRate) : promoter ? 0 : null,
      allowedEvents,
    });

    return this.couponsRepo.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.findById(id);

    if (dto.code) {
      const newCode = dto.code.trim().toUpperCase();
      if (newCode !== coupon.code) {
        const exists = await this.couponsRepo.findOne({ where: { code: newCode } });
        if (exists && exists.id !== coupon.id) {
          throw new BadRequestException('Ya existe un cupon con ese codigo');
        }
        coupon.code = newCode;
      }
    }

    if (dto.description !== undefined) {
      coupon.description = dto.description ?? null;
    }

    const effectiveType = dto.type ?? coupon.type;
    if (dto.type) {
      coupon.type = dto.type;
    }

    if (effectiveType === CouponType.FREE) {
      coupon.value = 0;
    } else if (dto.value !== undefined) {
      coupon.value = Number(dto.value);
    }

    if (dto.clearLimit) {
      coupon.maxRedemptions = null;
    } else if (dto.maxRedemptions !== undefined) {
      coupon.maxRedemptions = dto.maxRedemptions ?? null;
    }

    if (dto.isActive !== undefined) {
      coupon.isActive = dto.isActive;
    }

    if (dto.clearPromoter) {
      coupon.promoter = null;
      coupon.commissionRate = null;
    } else if (dto.promoterId !== undefined) {
      const promoter = await this.resolvePromoter(dto.promoterId);
      coupon.promoter = promoter;
      coupon.commissionRate =
        promoter && dto.commissionRate !== undefined
          ? Number(dto.commissionRate)
          : promoter
            ? coupon.commissionRate ?? 0
            : null;
    }

    if (dto.commissionRate !== undefined && !dto.clearPromoter && dto.promoterId === undefined) {
      if (!coupon.promoter) {
        coupon.commissionRate = null;
      } else {
        coupon.commissionRate = Number(dto.commissionRate);
      }
    }

    if (dto.clearEvents) {
      coupon.allowedEvents = [];
    } else if (Array.isArray(dto.eventIds)) {
      const events = await this.loadAllowedEvents(dto.eventIds);
      coupon.allowedEvents = events;
    }

    return this.couponsRepo.save(coupon);
  }

  private async loadAllowedEvents(eventIds?: string[] | null) {
    if (!eventIds || !eventIds.length) {
      return [];
    }

    const uniqueIds = Array.from(new Set(eventIds.map((id) => `${id}`.trim()).filter((id) => id.length)));
    if (!uniqueIds.length) {
      return [];
    }

    const events = await this.eventsRepo.find({ where: { id: In(uniqueIds) } });
    if (events.length !== uniqueIds.length) {
      throw new BadRequestException('Alguno de los eventos seleccionados no existe');
    }

    return events;
  }

  async remove(id: string) {
    const coupon = await this.findById(id);
    await this.couponsRepo.remove(coupon);
    return { id };
  }

  async getCouponMetrics(id: string) {
    const coupon = await this.findById(id);

    // Subconsulta: métricas a nivel ORDEN (sin duplicar por items)
    const ordersAgg = this.couponsRepo.manager
      .createQueryBuilder()
      .from('order', 'o') // o: Order
      .select('o."couponId"', 'coupon_id')
      .addSelect('COUNT(*)', 'ordersCount')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'netRevenue')
      .addSelect('MAX(o."createdAt")', 'lastOrderAt')
      .where('o."couponId" = :id', { id })
      .andWhere('o.status IN (:...statuses)', { statuses: METRIC_STATUSES })
      .groupBy('o."couponId"');

    // Subconsulta: métricas a nivel ITEM
    const itemsAgg = this.couponsRepo.manager
      .createQueryBuilder()
      .from('order', 'o2') // o2: Order
      .leftJoin('o2.items', 'i') // i: OrderItem
      .select('o2."couponId"', 'coupon_id')
      .addSelect('COALESCE(SUM(i.quantity), 0)', 'ticketsSold')
      .addSelect('COALESCE(SUM(i.subtotal), 0)', 'grossRevenue')
      .where('o2."couponId" = :id', { id })
      .andWhere('o2.status IN (:...statuses)', { statuses: METRIC_STATUSES })
      .groupBy('o2."couponId"');

    const row = (await this.couponsRepo
      .createQueryBuilder('c') // c: Coupon
      .leftJoin(`(${ordersAgg.getQuery()})`, 'oa', 'oa.coupon_id = c.id')
      .leftJoin(`(${itemsAgg.getQuery()})`, 'ia', 'ia.coupon_id = c.id')
      .setParameters({
        ...ordersAgg.getParameters(),
        ...itemsAgg.getParameters(),
      })
      .select('c.id', 'coupon_id')
      .addSelect('COALESCE(oa."ordersCount", 0)', 'ordersCount')
      .addSelect('COALESCE(ia."ticketsSold", 0)', 'ticketsSold')
      .addSelect('COALESCE(ia."grossRevenue", 0)', 'grossRevenue')
      .addSelect('COALESCE(oa."netRevenue", 0)', 'netRevenue')
      // discount = gross - net (si no tenés discountAmount en Order)
      .addSelect('GREATEST(COALESCE(ia."grossRevenue", 0) - COALESCE(oa."netRevenue", 0), 0)', 'discountGiven')
      // no existe promoterCommissionAmount: dejar 0 o calcular después en TS
      .addSelect('0', 'commission')
      .addSelect('oa."lastOrderAt"', 'lastOrderAt')
      .where('c.id = :id', { id: coupon.id })
      .getRawOne<{
        ordersCount: string;
        ticketsSold: string;
        grossRevenue: string;
        discountGiven: string;
        netRevenue: string;
        commission: string;
        lastOrderAt: Date | null;
      }>()) ?? null;

    const ticketsSold = this.toNumber(row?.ticketsSold);
    const metrics = {
      orders: this.toNumber(row?.ordersCount),
      ticketsSold,
      grossRevenue: this.toNumber(row?.grossRevenue),
      discountGiven: this.toNumber(row?.discountGiven),
      netRevenue: this.toNumber(row?.netRevenue),
      commissionEarned: this.toNumber(row?.commission), // hoy queda en 0
      remainingQuota:
        coupon.maxRedemptions != null ? Math.max(0, coupon.maxRedemptions - ticketsSold) : null,
      lastOrderAt: row?.lastOrderAt ? new Date(row.lastOrderAt) : null,
    };

    return { coupon, metrics };
  }

  async getPromoterDashboard(promoterId: number) {
    const coupons = await this.couponsRepo.find({
      where: { promoter: { id: promoterId } },
      order: { createdAt: 'DESC' },
    });

    if (!coupons.length) {
      return {
        promoterId,
        totals: {
          coupons: 0,
          orders: 0,
          tickets: 0,
          grossRevenue: 0,
          discountGiven: 0,
          netRevenue: 0,
          commissionEarned: 0,
        },
        coupons: [],
      };
    }

    const ordersAgg = this.couponsRepo.manager
      .createQueryBuilder()
      .from(Order, 'o')
      .select('o."couponId"', 'coupon_id')
      .addSelect('COUNT(*)', 'ordersCount')
      .addSelect('COALESCE(SUM(o."totalAmount"), 0)', 'netRevenue')
      .addSelect('MAX(o."createdAt")', 'lastOrderAt')
      .where('o.status IN (:...statuses)', { statuses: METRIC_STATUSES })
      .groupBy('o."couponId"');

    const itemsAgg = this.couponsRepo.manager
      .createQueryBuilder()
      .from(Order, 'o2')
      .leftJoin('o2.items', 'i')
      .select('o2."couponId"', 'coupon_id')
      .addSelect('COALESCE(SUM(i.quantity), 0)', 'ticketsSold')
      .addSelect('COALESCE(SUM(i.subtotal), 0)', 'grossRevenue')
      .where('o2.status IN (:...statuses)', { statuses: METRIC_STATUSES })
      .groupBy('o2."couponId"');

    const rawMetrics = await this.couponsRepo
      .createQueryBuilder('c')                // Coupon
      .leftJoin('c.promoter', 'p')
      .where('p.id = :promoterId', { promoterId })
      .leftJoin(`(${ordersAgg.getQuery()})`, 'oa', 'oa.coupon_id = c.id')
      .leftJoin(`(${itemsAgg.getQuery()})`, 'ia', 'ia.coupon_id = c.id')
      .setParameters({
        ...ordersAgg.getParameters(),
        ...itemsAgg.getParameters(),
      })
      .select('c.id', 'coupon_id')
      .addSelect('COALESCE(oa."ordersCount", 0)', 'ordersCount')
      .addSelect('COALESCE(ia."ticketsSold", 0)', 'ticketsSold')
      .addSelect('COALESCE(ia."grossRevenue", 0)', 'grossRevenue')
      .addSelect('COALESCE(oa."netRevenue", 0)', 'netRevenue')
      .addSelect(
        'GREATEST(COALESCE(ia."grossRevenue", 0) - COALESCE(oa."netRevenue", 0), 0)',
        'discountGiven'
      )
      .addSelect('0', 'commission') // sin columna en Order; queda en 0
      .addSelect('oa."lastOrderAt"', 'lastOrderAt')
      .getRawMany<{
        coupon_id: string;
        ordersCount: string;
        ticketsSold: string;
        grossRevenue: string;
        discountGiven: string;
        netRevenue: string;
        commission: string;
        lastOrderAt: Date | null;
      }>();

    const metricsMap = new Map<string, typeof rawMetrics[number]>();
    for (const row of rawMetrics) {
      metricsMap.set(row.coupon_id, row);
    }

    const summary = coupons.map((coupon) => {
      const row = metricsMap.get(coupon.id);
      const ticketsSold = this.toNumber(row?.ticketsSold);

      return {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description ?? null,
        isActive: coupon.isActive,
        type: coupon.type,
        value: Number(coupon.value),
        commissionRate: coupon.commissionRate ?? 0,
        maxRedemptions: coupon.maxRedemptions ?? null,
        createdAt: coupon.createdAt,
        orders: this.toNumber(row?.ordersCount),
        ticketsSold,
        grossRevenue: this.toNumber(row?.grossRevenue),
        discountGiven: this.toNumber(row?.discountGiven),
        netRevenue: this.toNumber(row?.netRevenue),
        commissionEarned: this.toNumber(row?.commission),
        remainingQuota:
          coupon.maxRedemptions != null ? Math.max(0, coupon.maxRedemptions - ticketsSold) : null,
        lastOrderAt: row?.lastOrderAt ? new Date(row.lastOrderAt) : null,
      };
    });

    const totals = summary.reduce(
      (acc, item) => {
        acc.orders += item.orders;
        acc.tickets += item.ticketsSold;
        acc.grossRevenue += item.grossRevenue;
        acc.discountGiven += item.discountGiven;
        acc.netRevenue += item.netRevenue;
        acc.commissionEarned += item.commissionEarned;
        return acc;
      },
      {
        coupons: summary.length,
        orders: 0,
        tickets: 0,
        grossRevenue: 0,
        discountGiven: 0,
        netRevenue: 0,
        commissionEarned: 0,
      },
    );

    return {
      promoterId,
      totals,
      coupons: summary,
    };
  }

  async getPublicCoupon(code: string, eventIds: string[] = []) {
    const coupon = await this.findByCode(code, { onlyActive: true });
    if (!coupon || !coupon.isActive) {
      throw new NotFoundException('Cupon no disponible');
    }

    const allowedEvents = coupon.allowedEvents ?? [];
    const allowedIds = new Set(allowedEvents.map((event) => event.id));
    const requestedIds = Array.from(new Set((eventIds ?? []).filter((id) => typeof id === 'string' && id.length)));
    const restricted = allowedIds.size > 0;
    const applicable = !restricted || requestedIds.every((id) => allowedIds.has(id));

    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? null,
      type: coupon.type,
      value: Number(coupon.value ?? 0),
      maxRedemptions: coupon.maxRedemptions ?? null,
      isActive: coupon.isActive,
      restrictedToEventIds: restricted ? Array.from(allowedIds) : [],
      applicable,
      allowedEvents: allowedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
      })),
    };
  }

  private toNumber(value: string | number | null | undefined) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
  }

  private async resolvePromoter(promoterId?: number | null) {
    if (promoterId == null) {
      return null;
    }

    const promoter = await this.usersRepo.findOne({ where: { id: promoterId } });
    if (!promoter) {
      throw new BadRequestException('El promotor indicado no existe');
    }

    if (![Role.PROMOTOR, Role.ADMIN].includes(promoter.role)) {
      throw new BadRequestException('Solo se pueden asignar cupones a usuarios Promotor o Admin');
    }

    return promoter;
  }

  async getEventOptions() {
    const events = await this.eventsRepo.find({
      order: { date: 'ASC', time: 'ASC' },
    });

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      status: event.status,
      space: event.space,
    }));
  }
}













