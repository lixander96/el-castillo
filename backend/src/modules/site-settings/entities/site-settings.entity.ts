import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  mpAccessToken: string | null;

  @Column({ type: 'text', nullable: true })
  mpWebhookSecret: string | null;

  @Column({ type: 'text', nullable: true })
  logoLightUrl: string | null;

  @Column({ type: 'text', nullable: true })
  logoDarkUrl: string | null;

  @Column({ type: 'text', nullable: true })
  heroImageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  faviconUrl: string | null;

  @Column({ length: 120, nullable: true })
  siteName: string | null;

  @Column({ length: 240, nullable: true })
  siteTagline: string | null;

  @Column({ length: 40, default: 'EL CASTILLO' })
  paymentStatementDescriptor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
