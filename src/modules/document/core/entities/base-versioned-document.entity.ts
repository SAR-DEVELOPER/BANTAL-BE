// src/modules/document/core/entities/base-versioned-document.entity.ts
import {
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    BaseEntity,
  } from 'typeorm';
  import { MasterDocumentList } from './master-document-list.entity';
  
  export abstract class BaseVersionedDocument extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MasterDocumentList)
    @JoinColumn({ name: 'master_document_list_id' })
    masterDocument: MasterDocumentList;
  
    @Column({ name: 'version_number', type: 'int' })
    versionNumber: number;
  
    @Column({ name: 'is_latest', type: 'boolean', default: true })
    isLatest: boolean;
  
    @Column({ name: 'uploaded_by', type: 'uuid' })
    uploadedBy: string;
  }
  