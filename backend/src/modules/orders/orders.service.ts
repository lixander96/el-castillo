import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { Event } from '../events/entities/event.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { Ticket } from './entities/ticket.entity';
import { Coupon, CouponType } from '../coupons/entities/coupon.entity';
import { MailerService } from '../../mailer/mailer.service';
import { TicketPdfService } from './ticket-pdf.service';
import { EnvironmentVariables } from '../../config/config.configuration';
import { Address } from 'nodemailer/lib/mailer';
import { randomUUID } from 'crypto';

type TicketSummary = {
  eventTitle: string;
  ticketName: string;
  date: string;
  time: string;
  space: string;
  quantity: number;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    @InjectRepository(Event) private readonly eventsRepo: Repository<Event>,
    @InjectRepository(TicketType) private readonly ticketRepo: Repository<TicketType>,
    @InjectRepository(Ticket) private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(Coupon) private readonly couponsRepo: Repository<Coupon>,
    private readonly ds: DataSource,
    private readonly mailer: MailerService,
    private readonly ticketPdf: TicketPdfService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async create(dto: CreateOrderDto) {
    return this.ds.transaction(async (manager) => {
      let subtotal = 0;
      const items: OrderItem[] = [];
      const eventIdsInOrder = new Set<string>();

      for (const it of dto.items) {
        const tt = await manager.getRepository(TicketType).findOne({
          where: { id: it.ticketTypeId },
          relations: ['event'],
        });
        if (!tt || tt.event.id !== it.eventId) throw new BadRequestException('TicketType no válido');
        if (tt.available < it.quantity) throw new BadRequestException('Sin stock suficiente');

        const itemSubtotal = Number(tt.price) * it.quantity;
        subtotal += itemSubtotal;
        eventIdsInOrder.add(tt.event.id);

        const item = manager.getRepository(OrderItem).create({
          ticketType: tt,
          event: tt.event,
          quantity: it.quantity,
          unitPrice: Number(tt.price),
          subtotal: itemSubtotal,
        });
        items.push(item);

        // reservar stock (optimista)
        tt.sold += it.quantity;
        tt.available = Math.max(0, tt.total - tt.sold - Number(tt.manualSold ?? 0));
        await manager.getRepository(TicketType).save(tt);
      }

      // Aplicar cupon si corresponde
      let coupon: Coupon | null = null;
      let discount = 0;
      const normalizedCode = dto.couponCode?.trim().toUpperCase();
      if (normalizedCode) {
        coupon = await manager.getRepository(Coupon).findOne({
          where: { code: normalizedCode, isActive: true },
          relations: ['allowedEvents'],
        });
        if (!coupon) {
          throw new BadRequestException('Cupón inválido o inactivo');
        }
        const allowed = coupon.allowedEvents ?? [];
        if (allowed.length > 0) {
          const allowedIds = new Set(allowed.map((e) => e.id));
          for (const eid of eventIdsInOrder) {
            if (!allowedIds.has(eid)) {
              throw new BadRequestException('El cupón no aplica a este evento');
            }
          }
        }
        discount = this.computeDiscount(coupon, subtotal);
      }

      const total = Math.max(0, this.round2(subtotal - discount));

      const order = manager.getRepository(Order).create({
        buyerEmail: dto.buyerEmail || null,
        status: 'initiated',
        subtotalAmount: this.round2(subtotal),
        discountAmount: this.round2(discount),
        totalAmount: total,
        externalReference: null,
        preferenceId: null,
        coupon: coupon ?? undefined,
        items,
      });

      return manager.getRepository(Order).save(order);
    });
  }

  private computeDiscount(coupon: Coupon, subtotal: number): number {
    if (subtotal <= 0) return 0;
    const value = Number(coupon.value ?? 0);
    if (coupon.type === CouponType.FREE) return subtotal;
    if (coupon.type === CouponType.PERCENTAGE) {
      return Math.min(subtotal, this.round2(subtotal * (value / 100)));
    }
    return Math.min(subtotal, this.round2(value));
  }

  private round2(value: number): number {
    return Math.round(Number(value) * 100) / 100;
  }

  async createManualOrder(params: {
    buyerEmail?: string;
    notes?: string;
    items: { ticketTypeId: string; eventId: string; quantity: number }[];
  }) {
    return this.ds.transaction(async (manager) => {
      let subtotal = 0;
      const items: OrderItem[] = [];

      for (const it of params.items) {
        const tt = await manager.getRepository(TicketType).findOne({
          where: { id: it.ticketTypeId },
          relations: ['event'],
        });
        if (!tt || tt.event.id !== it.eventId) throw new BadRequestException('TicketType no válido');
        if (tt.available < it.quantity) throw new BadRequestException(`Sin stock para "${tt.name}"`);

        const itemSubtotal = Number(tt.price) * it.quantity;
        subtotal += itemSubtotal;

        const item = manager.getRepository(OrderItem).create({
          ticketType: tt,
          event: tt.event,
          quantity: it.quantity,
          unitPrice: Number(tt.price),
          subtotal: itemSubtotal,
        });
        items.push(item);

        tt.manualSold = Number(tt.manualSold ?? 0) + it.quantity;
        tt.available = Math.max(0, tt.total - tt.sold - tt.manualSold);
        await manager.getRepository(TicketType).save(tt);
      }

      const order = manager.getRepository(Order).create({
        buyerEmail: params.buyerEmail || null,
        status: 'approved',
        subtotalAmount: this.round2(subtotal),
        discountAmount: 0,
        totalAmount: this.round2(subtotal),
        paymentMethod: 'manual',
        externalReference: null,
        preferenceId: null,
        items,
      });
      const savedOrder = await manager.getRepository(Order).save(order);

      // Generar tickets
      const ticketsToSave: Ticket[] = [];
      for (const item of savedOrder.items) {
        for (let i = 0; i < item.quantity; i += 1) {
          ticketsToSave.push(
            manager.getRepository(Ticket).create({
              orderItem: item,
              code: randomUUID(),
              redeemedAt: null,
            }),
          );
        }
      }
      const savedTickets = ticketsToSave.length
        ? await manager.getRepository(Ticket).save(ticketsToSave)
        : [];

      return { order: savedOrder, tickets: savedTickets };
    });
  }

  async finalizeFreeOrder(orderId: string) {
    const order = await this.findById(orderId);
    if (Number(order.totalAmount) > 0) {
      throw new BadRequestException('La orden no es gratuita');
    }
    if (order.status === 'approved') {
      return order;
    }
    await this.ordersRepo.update({ id: orderId }, { paymentMethod: 'free', externalReference: orderId });
    return this.generateTicketsForApprovedOrder(orderId);
  }

  async findById(id: string) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: Order['status']) {
    await this.ordersRepo.update({ id }, { status });
    return this.findById(id);
  }

  async attachPreference(id: string, preferenceId: string, externalRef: string) {
    await this.ordersRepo.update({ id }, { preferenceId, externalReference: externalRef, status: 'pending' });
    return this.findById(id);
  }

  async releaseStockForOrder(orderId: string) {
    const order = await this.findById(orderId);
    return this.ds.transaction(async (manager) => {
      for (const it of order.items) {
        const tt = await manager.getRepository(TicketType).findOne({ where: { id: it.ticketType.id } });
        if (!tt) continue;
        tt.sold = Math.max(0, tt.sold - it.quantity);
        tt.available = Math.max(0, tt.total - tt.sold - Number(tt.manualSold ?? 0));
        await manager.getRepository(TicketType).save(tt);
      }
      order.status = 'rejected';
      await manager.getRepository(Order).save(order);
      return order;
    });
  }

  async generateTicketsForApprovedOrder(orderId: string) {
    const order = await this.findById(orderId);
    if (!order.items?.length) {
      throw new BadRequestException('La orden no contiene tickets para generar.');
    }

    let createdTickets: Ticket[] = [];

    if (order.status !== 'approved') {
      createdTickets = await this.ds.transaction(async (manager) => {
        const orderRepo = manager.getRepository(Order);
        const ticketRepo = manager.getRepository(Ticket);

        const orderToApprove = await orderRepo.findOne({
          where: { id: orderId },
          relations: ['items', 'items.event', 'items.ticketType'],
        });

        if (!orderToApprove) {
          throw new NotFoundException('Order not found');
        }

        orderToApprove.status = 'approved';
        await orderRepo.save(orderToApprove);

        const ticketsToSave: Ticket[] = [];
        for (const item of orderToApprove.items) {
          for (let i = 0; i < item.quantity; i += 1) {
            ticketsToSave.push(
              ticketRepo.create({
                orderItem: item,
                code: randomUUID(),
                redeemedAt: null,
              }),
            );
          }
        }

        if (!ticketsToSave.length) {
          return [];
        }

        return ticketRepo.save(ticketsToSave);
      });
    }

    const approvedOrder = await this.findById(orderId);
    const orderItemIds = approvedOrder.items.map((item) => item.id);

    const tickets = await this.ticketsRepo.find({
      where: { orderItem: { id: In(orderItemIds) } },
      order: { createdAt: 'ASC' },
    });

    if (approvedOrder.buyerEmail && tickets.length && createdTickets.length) {
      await this.sendOrderApprovedEmail(approvedOrder, tickets);
    }

    return approvedOrder;
  }

  private async sendOrderApprovedEmail(order: Order, tickets: Ticket[]) {
    const summary = this.summarizeTickets(tickets);
    const ticketCount = tickets.length;
    const subject = summary.length === 1 ? `Tus entradas para ${summary[0].eventTitle}` : `Tus ${ticketCount} entradas están listas`;
    const frontendUrl = this.configService.get('FRONTEND_URL') || '#';

    try {
      const pdf = await this.ticketPdf.build(order, tickets);

      const summaryHtml = summary
        .map((item, index) => {
          const border = index === summary.length - 1 ? 'none' : '1px solid #e2e8f0';
          return `
            <div style="display:flex; gap:16px; justify-content:space-between; padding:${index === 0 ? '0 0 16px 0' : '16px 0'}; border-bottom:${border};">
              <div style="flex:1;">
                <p style="margin:0; font-size:15px; font-weight:600; color:#0f172a;">${item.eventTitle}</p>
                <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">${item.date} · ${item.time} · ${item.space}</p>
              </div>
              <div style="text-align:right;">
                <p style="margin:0; font-size:13px; color:#64748b;">${item.ticketName}</p>
                <p style="margin:4px 0 0 0; font-size:20px; font-weight:700; color:#0ea5e9;">x${item.quantity}</p>
              </div>
            </div>
          `;
        })
        .join('');

      const html = `
        <div style="font-family:'Segoe UI',Arial,sans-serif; background-color:#0b1120; padding:32px 16px;">
          <div style="max-width:640px; margin:0 auto; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 30px 60px -40px rgba(15,23,42,0.8);">
            <div style="background:linear-gradient(135deg, #0ea5e9, #6366f1); padding:32px; color:#f8fafc;">
              <p style="margin:0; text-transform:uppercase; letter-spacing:0.2em; font-size:12px; font-weight:600; color:#bfdbfe;">El Castillo Barracas</p>
              <h1 style="margin:12px 0 0 0; font-size:28px; line-height:1.2;">${subject}</h1>
              <p style="margin:12px 0 0 0; font-size:15px; color:#e2e8f0;">Gracias por tu compra. Tus tickets ya están listos y los encuentras en el PDF adjunto.</p>
            </div>
            <div style="padding:28px 32px 36px 32px; color:#0f172a;">
              <p style="margin:0; font-size:16px; line-height:1.6;">Hola! Te enviamos <strong>${ticketCount === 1 ? 'tu entrada' : `${ticketCount} entradas`}</strong>. Descargá el archivo adjunto y presentá el código QR en la puerta para ingresar.</p>
              <div style="margin-top:24px; border:1px solid #e2e8f0; border-radius:18px; padding:24px; background:#f8fafc;">
                ${summaryHtml}
              </div>
              ${/*<a href="${frontendUrl}" style="display:inline-block; margin-top:28px; padding:14px 28px; border-radius:9999px; background:linear-gradient(135deg,#0ea5e9,#6366f1); color:#ffffff; font-weight:600; text-decoration:none;">Ver mi compra</a>*/''}
              <p style="margin:24px 0 0 0; font-size:13px; color:#475569;">Adjuntamos un PDF con los QR únicos de cada ticket. Mostralos en el ingreso para validar tu acceso.</p>
            </div>
            <div style="background:#0f172a; color:#cbd5f5; padding:18px 32px; font-size:12px;">
              <p style="margin:0;">Orden ${order.id}</p>
              <p style="margin:4px 0 0 0;">El Castillo Barracas · Cultura que vibra</p>
            </div>
          </div>
        </div>
      `;

      const text = this.buildPlainTextMessage(order, summary, ticketCount);

      const recipients: Address[] = [
        {
          address: order.buyerEmail!,
          name: order.buyerEmail!,
        },
      ];

      await this.mailer.send({
        recipients,
        subject,
        html,
        text,
        attachments: [
          {
            filename: pdf.filename,
            content: pdf.buffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de tickets para la orden ${order.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private summarizeTickets(tickets: Ticket[]): TicketSummary[] {
    const summaryMap = new Map<string, TicketSummary>();

    for (const ticket of tickets) {
      const { event, ticketType } = ticket.orderItem;
      const key = `${event.id}-${ticketType?.id ?? ticket.code}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          eventTitle: event.title,
          ticketName: ticketType?.name ?? 'Entrada',
          date: this.formatDate(event.date),
          time: this.formatTime(event.time),
          space: event.space,
          quantity: 0,
        });
      }
      summaryMap.get(key)!.quantity += 1;
    }

    return Array.from(summaryMap.values());
  }

  private buildPlainTextMessage(order: Order, summary: TicketSummary[], totalTickets: number) {
    const lines = summary
      .map(
        (item) =>
          `• ${item.eventTitle} (${item.ticketName}) - ${item.date} ${item.time} - ${item.quantity} ${
            item.quantity > 1 ? 'entradas' : 'entrada'
          }`,
      )
      .join('\n');

    return [
      summary.length === 1
        ? `Tus entradas para ${summary[0].eventTitle} ya están listas.`
        : `Tus ${totalTickets} entradas ya están listas.`,
      `Orden: ${order.id}`,
      '',
      lines,
      '',
      'Encontrá tus tickets en el PDF adjunto y presentá el código QR en el ingreso.',
    ].join('\n');
  }

  private formatDate(value: string) {
    if (!value) return 'Por confirmar';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private formatTime(value: string) {
    if (!value) return 'Por confirmar';
    return `${value} hs`;
  }
}
