import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { AssetGroup } from './asset-group.entity';

@Entity('asset_type')
export class AssetType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type_code', type: 'varchar', length: 255 })
  typeCode: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => AssetGroup, { nullable: false })
  @JoinColumn({ name: 'asset_group_id' })
  assetGroup: AssetGroup;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}