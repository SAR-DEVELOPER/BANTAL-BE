import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('meeting_account')
export class MeetingAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255 })
  accountName: string;

  @Column({ name: 'account_email', type: 'varchar', length: 255 })
  accountEmail: string;

  @Column({ name: 'account_status', type: 'varchar', length: 255 })
  accountStatus: string;

  @Column({ name: 'account_plan_type', type: 'varchar', length: 255 })
  accountPlanType: string;
}