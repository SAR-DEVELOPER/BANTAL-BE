/**
 * SuratPenawaran Entity (Offering Letter)
 * 
 * This entity represents offering letters in the system, which is a specific type
 * of document used for business proposals or offers to clients.
 * 
 * Table: surat_penawaran (in DOCUMENT schema)
 * 
 * Columns:
 * - clientId: UUID, identifies the client to whom the offer is directed
 * - documentDescription: Text, detailed description of the offer document
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
 * system, allowing for version control and specialized fields for offering letters.
 */

import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { BaseVersionedDocument } from "../base-versioned-document.entity";
import { Schemas } from "src/config/schema.config";
import { MasterDocumentList } from "../master-document-list.entity";
import { Identity } from "src/modules/identity/core/entities/identity.entity";

@Entity('surat_penawaran', { schema: Schemas.DOCUMENT })
export class SuratPenawaran extends BaseVersionedDocument {
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

    @Column({
        name: 'offered_service',
        type: 'text',
    })
    offeredService: string;

    @OneToOne(() => Identity)
    @JoinColumn({ name: 'person_in_charge' })
    personInCharge: Identity;

    @Column({
        name: 'person_in_charge',
        type: 'uuid',
        nullable: true,
        insert: false,
        update: false
    })
    personInChargeId: string;
}
