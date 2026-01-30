import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { Asset } from "./asset.entity";

export enum AssetHistoryAction {
    ACQUISITION = 'acquisition',
    RELOCATION = 'relocation',
    ASSIGNMENT = 'assignment',
    MAINTENANCE = 'maintenance',
    DEPRECIATION = 'depreciation',
    STATUS_CHANGE = 'status_change',
    DISPOSAL = 'disposal'
}

@Entity()
@Index(['asset', 'action'])
@Index(['asset', 'date'])
export class AssetHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Asset, (asset) => asset.id)
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @Column({ name: 'action', type: 'enum', enum: AssetHistoryAction })
    action: AssetHistoryAction;

    @Column({ name: 'date', type: 'date', nullable: false })
    date: Date;

    @Column({ name: 'description', type: 'text', nullable: true })
    description: string | null;

    @Column({ name: 'payload', type: 'jsonb', nullable: false })
    payload: Record<string, any>;

    @Column({ name: 'documents', type: 'jsonb', nullable: true })
    documents: string[] | null;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes: string | null;

    @Column({ name: 'approved_by', type: 'uuid', nullable: true })
    approvedBy: string | null;

    @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
    approvedAt: Date | null;

    @Column({ name: 'created_by', type: 'uuid', nullable: false })
    createdBy: string;

    @Column({ name: 'updated_by', type: 'uuid', nullable: false })
    updatedBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}