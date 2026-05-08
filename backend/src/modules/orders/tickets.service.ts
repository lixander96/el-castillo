import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { randomUUID } from 'crypto';
import { Ticket } from './entities/ticket.entity';
import { TicketPdfService } from './ticket-pdf.service';
import { Role, User } from '../user/entities/user.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private readonly ticketsRepo: Repository<Ticket>,
    @InjectRepository(OrderItem) private readonly itemsRepo: Repository<OrderItem>,
    private readonly ticketPdfService: TicketPdfService,
  ) { }

  async getByCodeWithJoins(code: string) {
    const qb = this.ticketsRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.orderItem', 'orderItem')
      .innerJoinAndSelect('orderItem.event', 'event')
      .innerJoinAndSelect('orderItem.ticketType', 'ticketType')
      .innerJoinAndSelect('orderItem.order', 'order')
      .where('ticket.code = :code', { code });

    const t = await qb.getOne();
    if (!t) throw new NotFoundException('Ticket not found');
    return t;
  }

  async redeemForEvent(eventId: string, code: string, user?: Pick<User, 'id' | 'role' | 'email'>) {
    return this.ticketsRepo.manager.transaction(async (em) => {
      // lock para evitar doble ingreso simultáneo
      const t = await em
        .getRepository(Ticket)
        .createQueryBuilder('ticket')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('ticket.orderItem', 'orderItem')
        .innerJoinAndSelect('orderItem.event', 'event')
        .innerJoinAndSelect('orderItem.order', 'order')
        .where('ticket.code = :code', { code })
        .getOne();

      if (!t) throw new NotFoundException('Ticket not found');

      if (t.orderItem.event.id !== eventId) {
        throw new BadRequestException('El ticket no corresponde a este evento');
      }
      if (t.redeemedAt) {
        throw new BadRequestException('Ticket ya redimido');
      }
      if (t.orderItem.order?.status !== 'approved') {
        throw new BadRequestException('La orden no está aprobada');
      }

      t.redeemedAt = new Date();
      await em.getRepository(Ticket).save(t);

      // Si más adelante querés auditar quién lo validó, podés agregar aquí un log de check-in.
      // (De momento evitamos migraciones extras y usamos solo `redeemedAt`.)

      return t;
    });
  }

  // Mejoramos el redeem existente para verificar orden aprobada:
  async redeem(code: string) {
    const t = await this.getByCodeWithJoins(code);
    if (t.redeemedAt) throw new BadRequestException('Ticket ya redimido');
    if (t.orderItem.order?.status !== 'approved') {
      throw new BadRequestException('La orden no está aprobada');
    }
    t.redeemedAt = new Date();
    return this.ticketsRepo.save(t);
  }

  // --- NUEVO: validar contra un evento
  async validateForEvent(eventId: string, code: string) {
    const t = await this.getByCodeWithJoins(code);

    if (t.orderItem.event.id !== eventId) {
      // No corresponde al evento seleccionado
      return {
        valid: false,
        reason: 'wrong_event',
        eventId: t.orderItem.event.id,
        eventTitle: t.orderItem.event.title,
        ticketType: t.orderItem.ticketType.name,
        redeemedAt: t.redeemedAt,
      };
    }

    const orderStatus = t.orderItem.order?.status;
    const approved = orderStatus === 'approved';

    return {
      valid: approved && !t.redeemedAt,
      reason: !approved ? 'order_not_approved' : t.redeemedAt ? 'already_redeemed' : null,
      eventId: t.orderItem.event.id,
      eventTitle: t.orderItem.event.title,
      eventDate: t.orderItem.event.date,
      eventTime: t.orderItem.event.time,
      ticketType: t.orderItem.ticketType.name,
      price: Number(t.orderItem.ticketType.price ?? 0),
      redeemedAt: t.redeemedAt,
      orderId: t.orderItem.order?.id ?? null,
      buyerEmail: t.orderItem.order?.buyerEmail ?? null,
      code: t.code,
      ticketId: t.id,
    };
  }

  async generateForOrderItem(orderItemId: string, qty: number) {
    const item = await this.itemsRepo.findOne({ where: { id: orderItemId } });
    if (!item) throw new NotFoundException('Order item not found');

    const tickets: Ticket[] = [];
    for (let i = 0; i < qty; i++) {
      const t = this.ticketsRepo.create({
        orderItem: item,
        code: randomUUID(), // esto va al QR
        redeemedAt: null,
      });
      tickets.push(t);
    }
    return this.ticketsRepo.save(tickets);
  }

  async getByCode(code: string) {
    const t = await this.ticketsRepo.findOne({ where: { code } });
    if (!t) throw new NotFoundException('Ticket not found');
    return t;
  }
  
  async findForUser(user: Pick<User, 'email'>) {
    if (!user?.email) {
      throw new BadRequestException('El usuario autenticado no tiene email asociado.');
    }

    return this.ticketsRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.orderItem', 'orderItem')
      .innerJoinAndSelect('orderItem.event', 'event')
      .innerJoinAndSelect('orderItem.ticketType', 'ticketType')
      .innerJoin('orderItem.order', 'order')
      .where('order.buyerEmail = :email', { email: user.email })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async getTicketPdfForUser(ticketId: string, user: User) {
    if (!user?.email) {
      throw new BadRequestException('El usuario autenticado no tiene email asociado.');
    }

    const ticket = await this.ticketsRepo
      .createQueryBuilder('ticket')
      .innerJoinAndSelect('ticket.orderItem', 'orderItem')
      .innerJoinAndSelect('orderItem.event', 'event')
      .innerJoinAndSelect('orderItem.ticketType', 'ticketType')
      .innerJoinAndSelect('orderItem.order', 'order')
      .where('ticket.id = :ticketId', { ticketId })
      .getOne();

    if (!ticket) {
      throw new NotFoundException('Ticket no encontrado');
    }

    const currentOrder = ticket.orderItem?.order;
    if (!currentOrder) {
      throw new NotFoundException('Orden asociada no encontrada');
    }
    const isAdmin = user.role === Role.ADMIN;
    if (!isAdmin && currentOrder?.buyerEmail !== user.email) {
      throw new ForbiddenException('No puedes descargar este ticket.');
    }

    return this.ticketPdfService.build(currentOrder, [ticket]);
  }
}
