// src/modules/document/document-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentType } from './core/entities/document-type.entity';

@Injectable()
export class DocumentTypeService {
  constructor(
    @InjectRepository(DocumentType)
    private documentTypeRepository: Repository<DocumentType>,
  ) {}

  async findAll(): Promise<DocumentType[]> {
    return this.documentTypeRepository.find();
  }

  // Raw SQL query example
  async findAllRawSql(): Promise<DocumentType[]> {
    return this.documentTypeRepository.query(
      'SELECT * FROM document_schema.document_type',
    );
  }
}
