/**
 * MasterDocumentList Entity
 * 
 * This entity represents the master list of documents in the system.
 * 
 * Table: master_document_list (in DOCUMENT schema)
 * 
 * Columns:
 * - id: UUID primary key, auto-generated
 * - documentNumber: String, unique constraint
 * - documentExternalNumber: String, unique constraint
 * - documentName: String
 * - documentLegalDate: String, date when the document was legally created/issued
 * - indexNumber: Integer
 * - documentStatus: Enum (DocumentStatus), default: DRAFT
 * 
 * Foreign Keys:
 * - type: References DocumentType entity (document_type_id)
 * - createdBy: References Identity entity (created_by)
 * - masterDivisionList: References MasterDivisionList entity (master_division_list_id)
 * - masterCompanyList: References MasterCompanyList entity (master_company_list_id)
 * 
 * Inherits all audit fields from BaseEntity:
 * - createdAt: Creation timestamp
 * - updatedAt: Last update timestamp
 * 
 * This entity is used to track and manage all documents within the system,
 * with references to their type, status, owning division and company.
 */

// src/modules/document/core/entities/master-document.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DocumentType } from './document-type.entity';
import { Schemas } from 'src/config/schema.config';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { DocumentStatus } from '../enums/document-status.enum';
import { Identity } from '@modules/identity/core/entities/identity.entity';
@Entity('master_document_list', { schema: Schemas.DOCUMENT })
export class MasterDocumentList extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'document_number',
    unique: true,
  })
  documentNumber: string;

  @Column({
    name: 'document_external_number',
    unique: true,
  })
  documentExternalNumber: string;

  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'document_type_id' })
  type: DocumentType;

  @Column({
    name: 'document_name'
  })
  documentName: string;

  @Column({
    name: 'document_legal_date',
  })
  documentLegalDate: string;

  @ManyToOne(() => Identity)
  @JoinColumn({ name: 'created_by' })
  createdBy: Identity;

  @ManyToOne(() => MasterDivisionList)
  @JoinColumn({ name: 'master_division_list_id' })
  masterDivisionList: MasterDivisionList;
  
  @ManyToOne(() => MasterCompanyList)
  @JoinColumn({ name: 'master_company_list_id' })
  masterCompanyList: MasterCompanyList;

  @Column({
    name: 'index_number',
    type: 'integer',
  })
  indexNumber: number;

  @Column({
    name: 'document_status',
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  documentStatus: DocumentStatus;

  @Column({
    name: 'mongo_document_id',
    type: 'uuid',
  })
  mongoDocumentId: string;
}
