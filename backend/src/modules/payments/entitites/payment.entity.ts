import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.payments, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ nullable: true })
  mpPaymentId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 24 })
  status: string; // approved | pending | rejected | ...

  @Column({ length: 64, nullable: true })
  statusDetail: string | null;

  @Column({ type: 'json', nullable: true })
  raw: any;

  @CreateDateColumn() createdAt: Date;
}
