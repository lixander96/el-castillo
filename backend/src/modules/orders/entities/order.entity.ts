import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entitites/payment.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

export type OrderStatus = 'initiated' | 'pending' | 'approved' | 'rejected' | 'cancelled';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120, nullable: true })
  buyerEmail: string | null;

  @Column({ type: 'varchar', length: 16, default: 'initiated' })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ nullable: true })
  externalReference: string | null; // MP external_reference

  @Column({ nullable: true })
  preferenceId: string | null; // MP preference id (Checkout Pro)

  @Column({ length: 32, default: 'mercadopago' })
  paymentMethod: string;

  @OneToMany(() => OrderItem, (i) => i.order, { cascade: true, eager: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (p) => p.order, { cascade: true })
  payments: Payment[];

  @ManyToOne(() => Coupon, coupon => coupon.orders, { nullable: true })
  coupon: Coupon | null;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
