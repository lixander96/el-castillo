import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Event } from '../../events/entities/event.entity';
import { TicketType } from '../../events/entities/ticket-type.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Event, { eager: true })
  event: Event;

  @ManyToOne(() => TicketType, { eager: true })
  ticketType: TicketType;

  @Column('int')
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;
}
