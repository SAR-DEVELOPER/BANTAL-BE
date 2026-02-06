import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Asset } from './asset.entity';

@Entity('asset_value_yearly')
export class AssetValueYearly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.id)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column()
  startingMonth: number;

  @Column()
  startingValue: number;

  @Column()
  endingMonth: number;

  @Column()
  endingValue: number;

  @Column()
  year: number;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}