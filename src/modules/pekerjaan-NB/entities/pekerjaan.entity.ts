import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProjectMilestone } from './project-milestone.entity';

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

  @Column({ name: 'payment_structure', type: 'jsonb' })
  paymentStructure: Record<string, any>;

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
} 