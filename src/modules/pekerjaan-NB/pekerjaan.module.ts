import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PekerjaanService } from './pekerjaan.service';
import { PekerjaanController } from './pekerjaan.controller';
import { Pekerjaan } from './entities/pekerjaan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pekerjaan])],
  controllers: [PekerjaanController],
  providers: [PekerjaanService],
  exports: [PekerjaanService],
})
export class PekerjaanModule {} 