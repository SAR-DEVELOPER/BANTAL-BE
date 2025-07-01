import { IsNotEmpty, IsString, IsUUID, IsOptional, IsEnum, IsNumber, IsDateString, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum MilestonePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class CreateMilestoneDataDto {
  @IsNotEmpty()
  @IsString()
  milestoneName: string;

  @IsOptional()
  @IsString()
  milestoneDescription?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @IsOptional()
  @IsNumber()
  completionPercentage?: number;

  @IsOptional()
  @IsEnum(MilestonePriority)
  priority?: MilestonePriority;

  // orderIndex is auto-generated and not accepted in create requests
}

export class UpdateMilestoneDataDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  milestoneName?: string;

  @IsOptional()
  @IsString()
  milestoneDescription?: string | null;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;

  @IsOptional()
  @IsNumber()
  completionPercentage?: number;

  @IsOptional()
  @IsEnum(MilestonePriority)
  priority?: MilestonePriority;

  @IsOptional()
  @IsNumber()
  orderIndex?: number;
}

export class GetMilestonesDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string;
}

export class CreateMilestoneDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateMilestoneDataDto)
  data: CreateMilestoneDataDto;
}

export class UpdateMilestoneDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateMilestoneDataDto)
  data: UpdateMilestoneDataDto;
}

export class DeleteMilestoneDto {
  @IsNotEmpty()
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @IsUUID()
  milestoneId: string;
} 