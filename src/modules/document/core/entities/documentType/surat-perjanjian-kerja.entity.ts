import { Column, Entity } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";

@Entity('surat_perjanjian_kerja', { schema: Schemas.DOCUMENT })
export class SuratPerjanjianKerja extends BaseVersionedDocument {
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
}