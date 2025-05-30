import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pekerjaan')
export class Pekerjaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_name' })
  projectName: string;

  @Column({ name: 'spk_id' })
  spkId: string;

  @Column({ name: 'team_member_structure', type: 'jsonb' })
  teamMemberStructure: Record<string, any>;

  @Column({ name: 'work_milestone', type: 'jsonb' })
  workMilestone: Record<string, any>;

  @Column({ name: 'payment_structure', type: 'jsonb' })
  paymentStructure: Record<string, any>;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 