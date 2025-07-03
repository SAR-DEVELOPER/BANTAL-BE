// src/modules/document/document.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DocumentType,
  MasterDocumentList,
} from './core/entities';

// Document type entities
import { SuratPenawaran } from './core/entities/documentType/surat-penawaran.entity';
import { SuratPerjanjianKerja } from './core/entities/documentType/surat-perjanjian-kerja.entity';
import { SuratTagihanNonBulanan } from './core/entities/documentType/surat-tagihan-non-bulanan.entity';

// Existing service and controller
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { CreateDocumentController } from './create-document.controller';
import { FinalizeDocumentController } from './finalize-document.controller';

// New services
import { DocumentTypeService } from './document-type.service';
import { DocumentTypeController } from './document-type.controller';
import { DocumentFactoryService } from './document-factory.service';
import { SuratPenawaranService } from './document-type/surat-penawaran.service';
import { SuratPerjanjianKerjaService } from './document-type/surat-perjanjian-kerja.service';
import { SuratTagihanNonBulananService } from './document-type/surat-tagihan-non-bulanan.service';
import { SuratPerjanjianKerjaController } from './surat-perjanjian-kerja.controller';

// External entities
import { Identity } from '@modules/identity/core/entities/identity.entity';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { MongoDBModule } from '../mongodb/mongodb.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentSchema } from '../mongodb/schemas/document.schema';
import { DebugController } from './debug.controller';

// Pekerjaan module import
import { PekerjaanModule } from '../pekerjaan-NB/pekerjaan.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core entities
      DocumentType, 
      MasterDocumentList,
      
      // Document type entities
      SuratPenawaran,
      SuratPerjanjianKerja,
      SuratTagihanNonBulanan,
      
      // External entities
      Identity,
      MasterDivisionList,
      MasterCompanyList,
    ]),
    MongoDBModule,
    MongooseModule.forFeature([
      { name: 'Document', schema: DocumentSchema }
    ]),
    // Import PekerjaanModule to access PekerjaanService
    PekerjaanModule,
  ],
  providers: [
    // Core services
    DocumentService,
    DocumentTypeService,
    DocumentFactoryService,
    
    // Document type services
    SuratPenawaranService,
    SuratPerjanjianKerjaService,
    SuratTagihanNonBulananService,
  ],
  controllers: [
    DocumentController,
    DocumentTypeController,
    DebugController,
    CreateDocumentController,
    FinalizeDocumentController,
    SuratPerjanjianKerjaController
  ],
  exports: [
    DocumentService,
    DocumentTypeService,
    DocumentFactoryService,
    SuratPenawaranService,
    SuratPerjanjianKerjaService,
    SuratTagihanNonBulananService,
  ],
})
export class DocumentModule {}
