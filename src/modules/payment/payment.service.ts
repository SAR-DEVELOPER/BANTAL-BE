import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pekerjaan } from '../pekerjaan-NB/entities/pekerjaan.entity';
import { ProjectMilestone } from '../pekerjaan-NB/entities/project-milestone.entity';
import { PaymentInstallment } from '../pekerjaan-NB/entities/payment-installment.entity';
import { PaymentStructureUpdateDto, PaymentStructureResponseDto } from '../pekerjaan-NB/dto/payment-structure.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Pekerjaan)
    private readonly pekerjaanRepository: Repository<Pekerjaan>,
    @InjectRepository(PaymentInstallment)
    private readonly paymentInstallmentRepository: Repository<PaymentInstallment>,
    @InjectRepository(ProjectMilestone)
    private readonly projectMilestoneRepository: Repository<ProjectMilestone>,
  ) {}

  /**
   * Get payment structure for a specific pekerjaan
   */
  async getPaymentStructure(pekerjaanId: string): Promise<PaymentStructureResponseDto> {
    this.logger.debug(`Getting payment structure for pekerjaan: ${pekerjaanId}`);
    
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: pekerjaanId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${pekerjaanId} not found`);
    }

    // Get all payment installments for this project
    const installments = await this.paymentInstallmentRepository.find({
      where: { pekerjaanId },
      relations: ['projectMilestone'],
      order: { installmentNumber: 'ASC' }
    });

    // Calculate completion percentage
    const completionPercentage = this.calculateCompletionPercentage(pekerjaan, installments);
    const status = completionPercentage === 100 ? 'completed' : 'pending';

    const result = {
      projectId: pekerjaanId,
      status,
      completionPercentage,
      data: {
        basicInfo: {
          projectFee: pekerjaan.projectFee,
          currency: pekerjaan.currency,
          bankName: pekerjaan.bankName,
          accountNumber: pekerjaan.accountNumber,
          accountName: pekerjaan.accountName,
        },
        installments: installments.map(inst => ({
          id: inst.id,
          installmentNumber: inst.installmentNumber,
          amount: Number(inst.amount),
          percentage: Number(inst.percentage),
          triggerType: inst.triggerType as any,
          triggerValue: inst.triggerValue,
          projectMilestoneId: inst.projectMilestoneId,
          description: inst.description,
          status: inst.status as any,
          notes: inst.notes,
          dueDate: inst.dueDate,
        }))
      },
      message: `Payment structure is ${completionPercentage}% complete`
    };

    this.logger.debug(`Payment structure retrieved successfully for pekerjaan: ${pekerjaanId}`);
    return result;
  }

  /**
   * Update payment structure for a specific pekerjaan
   */
  async updatePaymentStructure(pekerjaanId: string, data: PaymentStructureUpdateDto): Promise<PaymentStructureResponseDto> {
    this.logger.debug(`Updating payment structure for pekerjaan: ${pekerjaanId}`);
    
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: pekerjaanId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${pekerjaanId} not found`);
    }

    // Update basic info if provided
    if (data.basicInfo) {
      await this.updateBasicInfo(pekerjaan, data.basicInfo);
    }

    // Update installments if provided
    if (data.installments) {
      await this.updateInstallments(pekerjaanId, data.installments);
    }

    this.logger.debug(`Payment structure updated successfully for pekerjaan: ${pekerjaanId}`);
    
    // Return updated payment structure
    return this.getPaymentStructure(pekerjaanId);
  }

  /**
   * Delete a payment installment
   */
  async deletePaymentInstallment(pekerjaanId: string, installmentId: string): Promise<PaymentStructureResponseDto> {
    this.logger.debug(`Deleting payment installment: ${installmentId} for pekerjaan: ${pekerjaanId}`);
    
    const pekerjaan = await this.pekerjaanRepository.findOne({ 
      where: { id: pekerjaanId } 
    });

    if (!pekerjaan) {
      throw new NotFoundException(`Pekerjaan with id ${pekerjaanId} not found`);
    }

    const installment = await this.paymentInstallmentRepository.findOne({
      where: { id: installmentId, pekerjaanId }
    });

    if (!installment) {
      throw new NotFoundException(`Payment installment with id ${installmentId} not found for this project`);
    }

    await this.paymentInstallmentRepository.remove(installment);
    
    this.logger.debug(`Payment installment deleted successfully: ${installmentId}`);

    // Return updated payment structure
    return this.getPaymentStructure(pekerjaanId);
  }

  /**
   * Calculate payment structure completion percentage
   */
  private calculateCompletionPercentage(pekerjaan: Pekerjaan, installments: PaymentInstallment[]): number {
    const completionChecks: boolean[] = [];

    // Check basic info completion (25% weight)
    const hasProjectFee = pekerjaan.projectFee !== null && pekerjaan.projectFee > 0;
    const hasCurrency = !!(pekerjaan.currency && pekerjaan.currency.trim() !== '');
    completionChecks.push(hasProjectFee && hasCurrency);

    // Check installments defined (25% weight)
    const hasInstallments = installments.length > 0;
    completionChecks.push(hasInstallments);

    // Check all installments have proper triggers (25% weight)
    const allInstallmentsComplete = hasInstallments && installments.every(inst => 
      inst.triggerType && inst.description && inst.description.trim() !== ''
    );
    completionChecks.push(allInstallmentsComplete);

    // Check bank details (25% weight)
    const hasBankDetails = !!(pekerjaan.bankName && pekerjaan.accountNumber && pekerjaan.accountName);
    completionChecks.push(hasBankDetails);

    return Math.round((completionChecks.filter(check => check === true).length / completionChecks.length) * 100);
  }

  /**
   * Update basic payment information
   */
  private async updateBasicInfo(pekerjaan: Pekerjaan, basicInfo: any): Promise<void> {
    if (basicInfo.projectFee !== undefined) {
      if (basicInfo.projectFee < 0) {
        throw new BadRequestException('Project fee cannot be negative');
      }
      pekerjaan.projectFee = basicInfo.projectFee;
    }
    
    if (basicInfo.currency !== undefined) {
      pekerjaan.currency = basicInfo.currency.trim();
    }
    
    if (basicInfo.bankName !== undefined) {
      pekerjaan.bankName = basicInfo.bankName?.trim() || null;
    }
    
    if (basicInfo.accountNumber !== undefined) {
      pekerjaan.accountNumber = basicInfo.accountNumber?.trim() || null;
    }
    
    if (basicInfo.accountName !== undefined) {
      pekerjaan.accountName = basicInfo.accountName?.trim() || null;
    }
    
    await this.pekerjaanRepository.save(pekerjaan);
  }

  /**
   * Update payment installments
   */
  private async updateInstallments(pekerjaanId: string, installments: any[]): Promise<void> {
    // Validate total percentage
    const totalPercentage = installments.reduce((sum, inst) => sum + inst.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException('Total installment percentages must equal 100%');
    }

    // Validate milestone references and trigger values
    for (const installment of installments) {
      await this.validateInstallment(pekerjaanId, installment);
    }

    // Process installments (create/update)
    for (const installmentData of installments) {
      await this.processInstallment(pekerjaanId, installmentData);
    }
  }

  /**
   * Validate installment data
   */
  private async validateInstallment(pekerjaanId: string, installment: any): Promise<void> {
    if (installment.triggerType === 'milestone' && installment.projectMilestoneId) {
      const milestone = await this.projectMilestoneRepository.findOne({
        where: { id: installment.projectMilestoneId, pekerjaanId }
      });
      if (!milestone) {
        throw new BadRequestException(`Milestone with id ${installment.projectMilestoneId} not found for this project`);
      }
    }

    // Validate trigger values for different types
    if (installment.triggerType === 'date' && installment.triggerValue) {
      const dueDate = new Date(installment.triggerValue);
      if (isNaN(dueDate.getTime())) {
        throw new BadRequestException('Invalid due date format');
      }
      installment.dueDate = dueDate;
    } else if (installment.triggerType === 'event') {
      // For now, only document_submission is allowed
      if (installment.triggerValue !== 'document_submission') {
        throw new BadRequestException('Only "document_submission" event is currently supported');
      }
    }
  }

  /**
   * Process individual installment (create or update)
   */
  private async processInstallment(pekerjaanId: string, installmentData: any): Promise<void> {
    let installment: PaymentInstallment;

    if (installmentData.id) {
      // Update existing installment
      const existingInstallment = await this.paymentInstallmentRepository.findOne({
        where: { id: installmentData.id, pekerjaanId }
      });

      if (!existingInstallment) {
        throw new NotFoundException(`Payment installment with id ${installmentData.id} not found for this project`);
      }
      installment = existingInstallment;
    } else {
      // Create new installment
      installment = new PaymentInstallment();
      installment.pekerjaanId = pekerjaanId;
    }

    // Update fields
    installment.installmentNumber = installmentData.installmentNumber;
    installment.amount = installmentData.amount;
    installment.percentage = installmentData.percentage;
    installment.triggerType = installmentData.triggerType;
    installment.triggerValue = installmentData.triggerValue || null;
    installment.projectMilestoneId = installmentData.projectMilestoneId || null;
    installment.description = installmentData.description;
    installment.status = installmentData.status || 'pending';
    installment.notes = installmentData.notes || null;
    installment.dueDate = installmentData.dueDate || null;

    await this.paymentInstallmentRepository.save(installment);
  }
} 