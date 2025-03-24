// src/modules/document/core/entities/document-info.entity.ts
import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { MasterDocumentList } from './master-document-list.entity';
import { DocumentStatus } from '../enums/document-status.enum';

@Entity('document_info', { schema: 'document_schema' })
export class DocumentInfo extends BaseEntity {
  @OneToOne(() => MasterDocumentList)
  @JoinColumn({ name: 'document_id' })
  document: MasterDocumentList;

  @Column({
    name: 'signed_by',
    type: 'uuid',
    nullable: true,
  })
  signedBy: string;

  @Column({
    name: 'signed_at',
    type: 'timestamp',
    nullable: true,
  })
  signedAt: Date;

  @Column({ name: 'recipient_name' })
  recipientName: string;

  @Column({
    name: 'recipient_address',
    type: 'text',
  })
  recipientAddress: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;
}
