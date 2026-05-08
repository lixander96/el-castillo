import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { Event } from '../../events/entities/event.entity';

export enum CouponType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  FREE = 'FREE',
}

@Entity()
@Unique(['code'])
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 48 })
  code: string;

  @Column({ length: 255, nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: CouponType, default: CouponType.AMOUNT })
  type: CouponType;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate?: number | null;

  @Column({ type: 'int', nullable: true })
  maxRedemptions?: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, { nullable: true, eager: true })
  promoter?: User | null;

  @OneToMany(() => Order, (order) => order.coupon)
  orders: Order[];

  @ManyToMany(() => Event, { eager: true })
  @JoinTable({
    name: 'coupon_allowed_events',
    joinColumn: { name: 'coupon_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'event_id', referencedColumnName: 'id' },
  })
  allowedEvents?: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
