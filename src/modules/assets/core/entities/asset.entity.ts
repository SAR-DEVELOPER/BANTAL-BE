import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AssetGroup } from './asset-group.entity';
import { AssetType } from './asset-type.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { Room } from './room.entity';
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { Office } from './office.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_code', type: 'varchar', length: 255 })
  assetCode: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @ManyToOne(() => MasterCompanyList, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: MasterCompanyList;

  @ManyToOne(() => AssetGroup, { nullable: false })
  @JoinColumn({ name: 'asset_group_id' })
  assetGroup: AssetGroup;

  @ManyToOne(() => AssetType, { nullable: false })
  @JoinColumn({ name: 'asset_type_id' })
  assetType: AssetType;

  @ManyToOne(() => Office, { nullable: false })
  @JoinColumn({ name: 'office_id' })
  office: Office;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room | null;

  @ManyToOne(() => Identity, { nullable: true })
  @JoinColumn({ name: 'employee_id' })
  employee: Identity | null;

  @Column({ name: 'acquisition_date', type: 'date', nullable: true })
  acquisitionDate: Date | null;

  @Column({ name: 'acquisition_price', type: 'decimal', precision: 19, scale: 4, nullable: true })
  acquisitionPrice: number | null;

  @Column({ name: 'vat', type: 'decimal', precision: 19, scale: 4, nullable: true })
  vat: number | null;

  @Column({ name: 'tax_invoice_number', type: 'varchar', length: 255, nullable: true })
  taxInvoiceNumber: string | null;

  @Column({ name: 'tax_invoice_file', type: 'varchar', length: 500, nullable: true })
  taxInvoiceFile: string | null;

  @Column({ name: 'invoice_number', type: 'varchar', length: 255, nullable: true })
  invoiceNumber: string | null;

  @Column({ name: 'invoice_file', type: 'varchar', length: 500, nullable: true })
  invoiceFile: string | null;

  @Column({ name: 'current_condition', type: 'text', nullable: true })
  currentCondition: string | null;

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