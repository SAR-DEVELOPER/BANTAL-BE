import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Schemas } from '../config/schema.config';

@Entity('master_company_list', { schema: Schemas.PUBLIC })
export class MasterCompanyList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'company_code',
    unique: true,
  })
  companyCode: string;

  @Column({
    name: 'company_name',
    unique: true,
  })
  companyName: string;

  @Column({
    name: 'address',
    type: 'text',
    nullable: true,
  })
  address: string;

  @Column({
    name: 'phone_number',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    name: 'email',
    nullable: true,
  })
  email: string;

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
