import { Column, Entity, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";
import { MasterDocumentList } from "../master-document-list.entity";

@Entity('surat_perjanjian_kerja', { schema: Schemas.DOCUMENT })
export class SuratPerjanjianKerja extends BaseVersionedDocument {
    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;

    @ManyToOne(() => MasterDocumentList)
    @JoinColumn({ name: 'master_document_list_id' })
    masterDocument: MasterDocumentList;

    @Column({
        name: 'master_document_list_id',
        type: 'uuid',
        nullable: false
    })
    masterDocumentId: string;

    @Column({
        name: 'client_id',
        type: 'uuid',
    })
    clientId: string;

    @Column({
        name: 'document_description',
        type: 'text',
    })
    documentDescription: string;

    @Column({
        name: 'start_date',
        type: 'date',
    })
    startDate: Date;

    @Column({
        name: 'end_date',
        type: 'date',
        nullable: true,
    })
    endDate: Date | null;

    @Column({
        name: 'project_fee',
        type: 'decimal',
        precision: 19,
        scale: 4,
    })
    projectFee: number;

    @Column({
        name: 'payment_installment',
        type: 'int',
    })
    paymentInstallment: number;

    @Column({
        name: 'isIncludeVAT',
        type: 'boolean',
        default: false
    })
    isIncludeVAT: boolean;
}