import { IsString, IsUUID, IsNotEmpty, IsNumber, IsDate, IsOptional, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isIncludeVAT?: boolean;

  // Alias for frontend compatibility
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isIncludeTax?: boolean;
} 