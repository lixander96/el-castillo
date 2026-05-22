import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TicketType } from './ticket-type.entity';
import { EventStatusEnum } from './event-status.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 160 })
  title: string;

  @Column({ length: 200, nullable: true, unique: true })
  slug: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 64 })
  date: string; // mantener string como en front (YYYY-MM-DD)

  @Column({ length: 32 })
  time: string; // "HH:mm"

  @Column({ length: 120 })
  space: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  ticketsSold: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'enum', enum: EventStatusEnum })
  status: EventStatusEnum;

  @Column({ type: 'text', nullable: true })
  image: string | null;

  @Column({ length: 64 })
  category: string;

  @Column({ default: false })
  featured: boolean;

  @OneToMany(() => TicketType, t => t.event, {
    cascade: ['insert', 'update'],       // inserta/actualiza hijos al salvar el padre
    orphanedRowAction: 'delete',         // borra los que ya no vengan en el array
    eager: true,                         // opcional, si querés traer siempre los tickets
  })
  ticketTypes: TicketType[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
