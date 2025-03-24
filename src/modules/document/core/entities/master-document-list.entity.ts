// src/modules/document/core/entities/master-document.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { DocumentType } from './document-type.entity';
import { Schemas } from 'src/config/schema.config';

@Entity('master_document_list', { schema: Schemas.DOCUMENT })
export class MasterDocumentList extends BaseEntity {
  @Column({
    name: 'document_number',
    unique: true,
  })
  documentNumber: string;

  @Column({ name: 'document_name' })
  documentName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @ManyToOne(() => DocumentType)
  @JoinColumn({ name: 'type_id' })
  type: DocumentType;
}
