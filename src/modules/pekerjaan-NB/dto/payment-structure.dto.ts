import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentInstallmentDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNumber()
  @Min(1)
  installmentNumber: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @IsEnum(['milestone', 'event', 'date', 'manual'])
  triggerType: 'milestone' | 'event' | 'date' | 'manual';

  @IsOptional()
  @IsString()
  triggerValue?: string | null;

  @IsOptional()
  @IsUUID()
  projectMilestoneId?: string | null;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(['pending', 'due', 'requested', 'paid'])
  status?: 'pending' | 'due' | 'requested' | 'paid';

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  dueDate?: Date | null;
}

export class PaymentStructureBasicInfoDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  projectFee?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}

export class PaymentStructureUpdateDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentStructureBasicInfoDto)
  basicInfo?: PaymentStructureBasicInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentInstallmentDto)
  installments?: PaymentInstallmentDto[];
}

export class PaymentStructureResponseDto {
  projectId: string;
  status: string;
  completionPercentage: number;
  data: {
    basicInfo: {
      projectFee: number | null;
      currency: string;
      bankName: string | null;
      accountNumber: string | null;
      accountName: string | null;
    };
    installments: PaymentInstallmentDto[];
  };
  message: string;
} 