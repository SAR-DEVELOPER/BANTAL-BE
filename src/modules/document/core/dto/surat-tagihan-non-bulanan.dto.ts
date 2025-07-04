import { IsString, IsUUID, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

interface BankInfo {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
}

/**
 * DTO for SuratTagihanNonBulanan (Non-Monthly Billing Letter) document type
 */
export class SuratTagihanNonBulananDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;

  @IsNumber()
  @IsNotEmpty()
  contractValue: number;

  @IsNumber()
  @IsNotEmpty()
  dppNilaiLain: number;

  @IsNumber()
  @IsNotEmpty()
  ppn12: number;

  @IsNumber()
  @IsNotEmpty()
  pph23: number;

  @IsNumber()
  @IsNotEmpty()
  totalTagihan: number;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  bankInfo?: BankInfo;

  @IsUUID()
  @IsNotEmpty()
  spkId: string;
} 