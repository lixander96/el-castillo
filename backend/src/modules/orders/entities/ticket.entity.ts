import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity()
@Unique(['code'])
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE', eager: true })
  orderItem: OrderItem;

  @Column()
  code: string; // UUID o hash: lo usamos para QR

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
