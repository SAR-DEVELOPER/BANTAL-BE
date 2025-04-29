import { IsString, IsOptional, IsUUID, IsBoolean, IsEmail } from 'class-validator';

export class CompanyDto {
  @IsUUID()
  id: string;

  @IsString()
  companyCode: string;

  @IsString()
  companyName: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  createdBy?: string;

  createdAt: Date;
  updatedAt: Date;
} 