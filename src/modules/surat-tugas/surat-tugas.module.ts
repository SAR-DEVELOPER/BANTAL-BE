import { Module } from '@nestjs/common';
import { SuratTugasService } from './surat-tugas.service';
import { SuratTugasController } from './surat-tugas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuratTugas } from 'src/entities/surat-tugas.entity';
import { MasterDocumentList } from '@modules/document/core/entities/master-document-list.entity';
import { TimPenugasan } from 'src/entities/tim-penugasan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuratTugas, MasterDocumentList, TimPenugasan])],
  providers: [SuratTugasService],
  controllers: [SuratTugasController],
})
export class SuratTugasModule {}