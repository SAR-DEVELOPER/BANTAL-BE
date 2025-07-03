/**
 * SuratTagihanNonBulanan Entity (Non-Monthly Billing Letter)
 * 
 * This entity represents non-monthly billing letters in the system, which is a specific type
 * of document used for billing clients on a non-monthly basis.
 * 
 * Table: surat_tagihan_non_bulanan (in DOCUMENT schema)
 * 
 * Columns:
 * - clientId: UUID, identifies the client being billed
 * - documentDescription: Text, detailed description of the billing document
 * 
 * Inherits from BaseVersionedDocument:
 * - id (PK): UUID, auto-generated
 * - version: Document version tracking
 * - isLatest: Boolean, indicates if this is the latest version
 * - uploadedBy: UUID, identifies the user who uploaded the document
 * - masterDocumentId: References the parent document in MasterDocumentList
 * 
 * Also inherits all audit fields from BaseEntity through BaseVersionedDocument:
 * - createdAt: Creation timestamp
 * - updatedAt: Last update timestamp
 * 
 * This entity represents a specific document type that extends the base document
 * system, allowing for version control and specialized fields for non-monthly billing letters.
 */

import { Entity, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";

@Entity('surat_tagihan_non_bulanan', { schema: Schemas.DOCUMENT })
export class SuratTagihanNonBulanan extends BaseVersionedDocument {
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

    @Column({
        name: 'master_document_list_id',
        type: 'uuid',
        nullable: false
    })
    masterDocumentId: string;

    // TODO: Change this to use a proper reference/relation to client entity in the future
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
} 