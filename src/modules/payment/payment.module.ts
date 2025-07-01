import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { Pekerjaan } from '../pekerjaan-NB/entities/pekerjaan.entity';
import { ProjectMilestone } from '../pekerjaan-NB/entities/project-milestone.entity';
import { PaymentInstallment } from '../pekerjaan-NB/entities/payment-installment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pekerjaan, ProjectMilestone, PaymentInstallment])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {} 