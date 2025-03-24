// src/modules/document/document.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentType,
  MasterDocumentList,
  DocumentInfo,
} from './core/entities';

// Existing service and controller
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';

// New service and controller for DocumentType
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentType, MasterDocumentList, DocumentInfo]),
  ],
  providers: [
    DocumentService,
    DocumentTypeService, // Add the new service
  ],
  controllers: [
    DocumentController,
    DocumentTypeController, // Add the new controller
  ],
  exports: [
    DocumentService,
    DocumentTypeService, // Export if needed by other modules
  ],
})
export class DocumentModule {}
