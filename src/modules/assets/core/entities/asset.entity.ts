import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AssetGroup } from './asset-group.entity';
import { AssetType } from './asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_code', type: 'varchar', length: 255 })
  assetCode: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => MasterCompanyList, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: MasterCompanyList;

  @ManyToOne(() => AssetGroup, { nullable: false })
  @JoinColumn({ name: 'asset_group_id' })
  assetGroup: AssetGroup;

  @ManyToOne(() => AssetType, { nullable: false })
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;
  
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedBy: string;
}