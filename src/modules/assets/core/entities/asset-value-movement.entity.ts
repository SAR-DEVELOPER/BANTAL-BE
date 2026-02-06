import { Column, CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { Asset } from "./asset.entity";
import { AssetHistory } from "./asset-history.entity";

export enum AssetValueMovementType {
  REPAIR = 'repair',
  ADDITION = 'addition',
  RENEWAL = 'renewal',
  REVALUATION = 'revaluation',
  DEPRECIATION = 'depreciation',
  DISPOSAL = 'disposal',
  OTHER = 'other',
}

export class AssetValueMovement {
  @Column("uuid")
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.id)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'enum', enum: AssetValueMovementType })
  type: string;

  @ManyToOne(() => AssetHistory, (assetHistory) => assetHistory.id)
  @JoinColumn({ name: 'asset_history_id' }) nullable: true
  assetHistory: AssetHistory | null;

  @Column( { nullable: true })
  description: string | null;

  @Column()
  valueMovement: number; // positive for addition, negative for depreciation, disposal, etc.

  @Column()
  value: number; // value of the asset after the movement

  @Column()
  date: Date;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}