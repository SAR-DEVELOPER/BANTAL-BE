import { IsNotEmpty, IsString, IsObject, IsOptional } from 'class-validator';

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
  @IsObject()
  workMilestone?: Record<string, any>;

  @IsOptional()
  @IsObject()
  paymentStructure?: Record<string, any>;
} 