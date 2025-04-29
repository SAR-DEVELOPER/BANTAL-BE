import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class DivisionDto {
  @IsUUID()
  id: string;

  @IsString()
  divisionCode: string;

  @IsString()
  divisionName: string;

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