import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProjectMilestone } from './project-milestone.entity';
import { PaymentInstallment } from './payment-installment.entity';

@Entity('pekerjaan')
export class Pekerjaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_name' })
  projectName: string;

  @Column({ name: 'project_description', default: '' })
  projectDescription: string;

  @Column({ name: 'spk_id' })
  spkId: string;

  @Column({ name: 'team_member_structure', type: 'jsonb' })
  teamMemberStructure: Record<string, any>;

  // Basic payment information
  @Column({ name: 'project_fee', type: 'decimal', precision: 19, scale: 4, nullable: true })
  projectFee: number | null;

  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'IDR' })
  currency: string;

  @Column({ name: 'bank_name', type: 'varchar', nullable: true })
  bankName: string | null;

  @Column({ name: 'account_number', type: 'varchar', nullable: true })
  accountNumber: string | null;

  @Column({ name: 'account_name', type: 'varchar', nullable: true })
  accountName: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'creation_status', type: 'enum', enum: ['created', 'in_progress', 'completed'], default: 'created' })
  creation_status: string;

  @Column({ name: 'progress_status', type: 'enum', enum: ['on_track', 'at_risk', 'delayed', 'issue'], default: 'on_track' })
  progressStatus: string;

  @OneToMany(() => ProjectMilestone, milestone => milestone.pekerjaan)
  milestones: ProjectMilestone[];

  @OneToMany(() => PaymentInstallment, installment => installment.pekerjaan)
  paymentInstallments: PaymentInstallment[];
} 