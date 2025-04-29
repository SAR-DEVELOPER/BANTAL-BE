import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Schemas } from '../config/schema.config';

@Entity('master_division_list', { schema: Schemas.PUBLIC })
export class MasterDivisionList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'division_code',
    unique: true,
  })
  divisionCode: string;

  @Column({
    name: 'division_name',
    unique: true,
  })
  divisionName: string;

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    name: 'updated_at', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP', 
    onUpdate: 'CURRENT_TIMESTAMP' 
  })
  updatedAt: Date;
}
