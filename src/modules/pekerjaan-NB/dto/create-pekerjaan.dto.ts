import { IsNotEmpty, IsString, IsObject, IsOptional, IsNumber } from 'class-validator';

export class CreatePekerjaanDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsString()
  spkId: string;

  @IsOptional()
  @IsObject()
  teamMemberStructure?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  projectFee?: number | null;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  bankName?: string | null;

  @IsOptional()
  @IsString()
  accountNumber?: string | null;

  @IsOptional()
  @IsString()
  accountName?: string | null;
} 