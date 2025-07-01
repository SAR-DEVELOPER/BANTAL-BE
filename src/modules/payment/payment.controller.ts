import { Controller, Get, Put, Body, Param, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentStructureUpdateDto, PaymentStructureResponseDto } from '../pekerjaan-NB/dto/payment-structure.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Get payment structure by pekerjaan ID
   */
  @Get(':pekerjaanId')
  async getPaymentStructure(
    @Param('pekerjaanId', ParseUUIDPipe) pekerjaanId: string
  ): Promise<PaymentStructureResponseDto> {
    return this.paymentService.getPaymentStructure(pekerjaanId);
  }

  /**
   * Update payment structure by pekerjaan ID
   */
  @Put(':pekerjaanId')
  async updatePaymentStructure(
    @Param('pekerjaanId', ParseUUIDPipe) pekerjaanId: string,
    @Body() updateData: PaymentStructureUpdateDto
  ): Promise<PaymentStructureResponseDto> {
    if (!updateData || (!updateData.basicInfo && !updateData.installments)) {
      throw new BadRequestException('Update data must contain either basicInfo or installments');
    }
    
    return this.paymentService.updatePaymentStructure(pekerjaanId, updateData);
  }

  /**
   * Get payment structure completion status
   */
  @Get(':pekerjaanId/status')
  async getPaymentStatus(
    @Param('pekerjaanId', ParseUUIDPipe) pekerjaanId: string
  ): Promise<{ 
    pekerjaanId: string; 
    completionPercentage: number; 
    status: string; 
    message: string; 
  }> {
    const paymentStructure = await this.paymentService.getPaymentStructure(pekerjaanId);
    
    return {
      pekerjaanId,
      completionPercentage: paymentStructure.completionPercentage,
      status: paymentStructure.status,
      message: paymentStructure.message
    };
  }

  /**
   * Delete a specific payment installment
   */
  @Put(':pekerjaanId/installments/:installmentId/delete')
  async deletePaymentInstallment(
    @Param('pekerjaanId', ParseUUIDPipe) pekerjaanId: string,
    @Param('installmentId', ParseUUIDPipe) installmentId: string
  ): Promise<PaymentStructureResponseDto> {
    return this.paymentService.deletePaymentInstallment(pekerjaanId, installmentId);
  }
} 