// src/modules/document/document.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentType,
  MasterDocumentList,
} from './core/entities';

// Document type entities
import { SuratPenawaran } from './core/entities/documentType/surat_penawaran.entity';
import { SuratPerjanjianKerja } from './core/entities/documentType/surat-perjanjian-kerja.entity';

// Existing service and controller
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { CreateDocumentController } from './create-document.controller';

// New services
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';
import { DocumentFactoryService } from './document-factory.service';
import { SuratPenawaranService } from './document-type/surat-penawaran.service';
import { SuratPerjanjianKerjaService } from './document-type/surat-perjanjian-kerja.service';

// External entities
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { MongoDBModule } from '../mongodb/mongodb.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from '../mongodb/schemas/document.schema';
import { DebugController } from './debug.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core entities
      DocumentType, 
      MasterDocumentList,
      
      // Document type entities
      SuratPenawaran,
      SuratPerjanjianKerja,
      
      // External entities
      Identity,
      MasterDivisionList,
      MasterCompanyList,
    ]),
    MongoDBModule,
    MongooseModule.forFeature([
      { name: 'Document', schema: DocumentSchema }
    ]),
  ],
  providers: [
    // Core services
    DocumentService,
    DocumentTypeService,
    DocumentFactoryService,
    
    // Document type services
    SuratPenawaranService,
    SuratPerjanjianKerjaService,
  ],
  controllers: [
    DocumentController,
    CreateDocumentController,
    DocumentTypeController,
    DebugController,
  ],
  exports: [
    DocumentService,
    DocumentTypeService,
    DocumentFactoryService,
    SuratPenawaranService,
    SuratPerjanjianKerjaService,
  ],
})
export class DocumentModule {}
