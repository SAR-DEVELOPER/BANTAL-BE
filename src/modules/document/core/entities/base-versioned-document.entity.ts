// src/modules/document/core/entities/base-versioned-document.entity.ts
import {
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    BaseEntity,
    Entity,
  } from 'typeorm';
  import { MasterDocumentList } from './master-document-list.entity';
  
  export abstract class BaseVersionedDocument extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => MasterDocumentList, { nullable: false })
    @JoinColumn({ name: 'master_document_list_id' })
    masterDocument: MasterDocumentList;
  
    @Column({ name: 'master_document_list_id', type: 'uuid', nullable: false, insert: false, update: false })
    masterDocumentId: string;
  
    @Column({ name: 'version_number', type: 'int' })
    versionNumber: number;
  
    @Column({ name: 'is_latest', type: 'boolean', default: true })
    isLatest: boolean;
  
    @Column({ name: 'uploaded_by', type: 'uuid' })
    uploadedBy: string;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  