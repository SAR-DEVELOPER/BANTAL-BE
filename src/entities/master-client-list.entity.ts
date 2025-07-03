import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ClientType } from './client-type.entity';

export enum ClientStatus {
  ACTIVE = 'Active',
  BLACKLIST = 'blacklist',
  CAUTIOUS = 'cautious'
}

@Entity('master_client_list')
export class MasterClientList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  group: string;

  @ManyToOne(() => ClientType, { nullable: false })
  @JoinColumn({ name: 'type_id' })
  type: ClientType;

  @Column({ type: 'varchar', length: 255 })
  contact_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_position: string;

  @Column({ type: 'varchar', length: 255 })
  contact_email: string;

  @Column({ type: 'varchar', length: 50 })
  contact_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referral_from: string;

  @Column({ type: 'date', nullable: true })
  date_of_first_project: Date;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.ACTIVE
  })
  status: ClientStatus;

  @Column({ type: 'int', default: 1 })
  priority_number: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: true })
  isWapu: boolean;
}
