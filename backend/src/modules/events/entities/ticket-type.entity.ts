import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';

@Entity()
export class TicketType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (e) => e.ticketTypes, { onDelete: 'CASCADE' })
  event: Event;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  total: number;

  @Column({ type: 'int', default: 0 })
  sold: number;

  @Column({ type: 'int', default: 0 })
  manualSold: number;

  @Column({ type: 'int', default: 0 })
  available: number;

  @Column({ type: 'simple-json', nullable: true })
  perks?: string[];
}
