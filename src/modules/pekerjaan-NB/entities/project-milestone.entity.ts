import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pekerjaan } from './pekerjaan.entity';

@Entity('project_milestone')
export class ProjectMilestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'pekerjaan_id' })
  pekerjaanId: string;

  @ManyToOne(() => Pekerjaan)
  @JoinColumn({ name: 'pekerjaan_id' })
  pekerjaan: Pekerjaan;

  @Column({ name: 'milestone_name' })
  milestoneName: string;

  @Column({ name: 'milestone_description', type: 'text', nullable: true })
  milestoneDescription: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'status', type: 'enum', enum: ['pending', 'in_progress', 'completed', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ name: 'completion_percentage', type: 'int', default: 0 })
  completionPercentage: number;

  @Column({ name: 'priority', type: 'enum', enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
  priority: string;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 