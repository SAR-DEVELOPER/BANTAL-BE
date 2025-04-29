import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterCompanyList } from 'src/entities/master-company-list.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MasterCompanyList
    ]),
  ],
  providers: [
    CompanyService,
  ],
  controllers: [
    CompanyController,
  ],
  exports: [
    CompanyService,
  ],
})
export class CompanyModule {} 