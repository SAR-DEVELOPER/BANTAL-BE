import { IsString, IsUUID, IsNotEmpty, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for SuratPerjanjianKerja (Work Agreement) document type
 */
export class SuratPerjanjianKerjaDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsNotEmpty()
  projectFee: number;

  @IsNumber()
  @IsNotEmpty()
  paymentInstallment: number;
} 