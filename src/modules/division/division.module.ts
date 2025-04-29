import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDivisionList } from 'src/entities/master-division-list.entity';
import { DivisionService } from './division.service';
import { DivisionController } from './division.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterDivisionList
    ]),
  ],
  providers: [
    DivisionService,
  ],
  controllers: [
    DivisionController,
  ],
  exports: [
    DivisionService,
  ],
})
export class DivisionModule {} 