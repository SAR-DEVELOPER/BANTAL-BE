import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pekerjaan } from './pekerjaan.entity';
import { ProjectMilestone } from './project-milestone.entity';

@Entity('payment_installment')
export class PaymentInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pekerjaan_id' })
  pekerjaanId: string;

  @ManyToOne(() => Pekerjaan)
  @JoinColumn({ name: 'pekerjaan_id' })
  pekerjaan: Pekerjaan;

  @Column({ name: 'installment_number', type: 'int' })
  installmentNumber: number;

  @Column({ name: 'amount', type: 'decimal', precision: 19, scale: 4 })
  amount: number;

  @Column({ name: 'percentage', type: 'decimal', precision: 5, scale: 2 })
  percentage: number;

  @Column({ name: 'trigger_type', type: 'enum', enum: ['milestone', 'event', 'date', 'manual'] })
  triggerType: string;

  @Column({ name: 'trigger_value', type: 'varchar', nullable: true })
  triggerValue: string | null;

  @Column({ name: 'project_milestone_id', nullable: true })
  projectMilestoneId: string | null;

  @ManyToOne(() => ProjectMilestone, { nullable: true })
  @JoinColumn({ name: 'project_milestone_id' })
  projectMilestone: ProjectMilestone | null;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: ['pending', 'due', 'cleared', 'requested', 'paid', 'issue'], default: 'pending' })
  status: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 