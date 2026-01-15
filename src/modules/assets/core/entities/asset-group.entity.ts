import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('asset_group')
export class AssetGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'group_code', type: 'varchar', length: 255 })
  groupCode: string;

  @Column({ name: 'group_name', type: 'varchar', length: 255 })
  groupName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}