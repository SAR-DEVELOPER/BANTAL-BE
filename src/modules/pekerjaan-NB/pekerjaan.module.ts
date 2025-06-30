import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PekerjaanService } from './pekerjaan.service';
import { PekerjaanController } from './pekerjaan.controller';
import { CompletionController } from './function/completion/completion.controller';
import { CompletionService } from './function/completion/completion.service';
import { Pekerjaan } from './entities/pekerjaan.entity';
import { ProjectMilestone } from './entities/project-milestone.entity';
import { PaymentInstallment } from './entities/payment-installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pekerjaan, ProjectMilestone, PaymentInstallment])],
  controllers: [PekerjaanController, CompletionController],
  providers: [PekerjaanService, CompletionService],
  exports: [PekerjaanService, CompletionService],
})
export class PekerjaanModule {} 