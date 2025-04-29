// src/modules/document/document.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentType,
  MasterDocumentList,
} from './core/entities';

// Existing service and controller
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { CreateDocumentController } from './create-document.controller';

// New service and controller for DocumentType
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';

// External entities
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { MongoDBModule } from '../mongodb/mongodb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentType, 
      MasterDocumentList,
      Identity,
      MasterDivisionList,
      MasterCompanyList
    ]),
    MongoDBModule,
  ],
  providers: [
    DocumentService,
    DocumentTypeService,
  ],
  controllers: [
    DocumentController,
    CreateDocumentController,
    DocumentTypeController,
  ],
  exports: [
    DocumentService,
    DocumentTypeService,
  ],
})
export class DocumentModule {}
