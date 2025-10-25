import { Module } from '@nestjs/common';
import { SuratTugasService } from './surat-tugas.service';
import { SuratTugasController } from './surat-tugas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuratTugas } from 'src/entities/surat-tugas.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SuratTugas])],
  providers: [SuratTugasService],
  controllers: [SuratTugasController],
})
export class SuratTugasModule {}