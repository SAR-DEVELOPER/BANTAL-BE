import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PekerjaanService } from './pekerjaan.service';
import { PekerjaanController } from './pekerjaan.controller';
import { CompletionController } from './function/completion/completion.controller';
import { CompletionService } from './function/completion/completion.service';
import { MilestoneController } from './function/milestone/milestone.controller';
import { MilestoneService } from './function/milestone/milestone.service';
import { Pekerjaan } from './entities/pekerjaan.entity';
import { ProjectMilestone } from './entities/project-milestone.entity';
import { PaymentInstallment } from './entities/payment-installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pekerjaan, ProjectMilestone, PaymentInstallment])],
  controllers: [MilestoneController, CompletionController, PekerjaanController],
  providers: [PekerjaanService, CompletionService, MilestoneService],
  exports: [PekerjaanService, CompletionService, MilestoneService],
})
export class PekerjaanModule {} 