// src/modules/document/core/entities/document-type.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('document_type', { schema: 'document_schema' })
export class DocumentType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'type_name',
    unique: true,
  })
  typeName: string;
  
  @Column({
    name: 'shorthand',
    unique: true
  })
  shortHand: string;
}
