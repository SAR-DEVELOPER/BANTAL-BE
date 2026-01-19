import { IsOptional, IsUUID, IsBoolean, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAssetsDto {
  // Filtering
  @IsOptional()
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Asset group ID must be a valid UUID' })
  assetGroupId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Asset type ID must be a valid UUID' })
  assetTypeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Office ID must be a valid UUID' })
  officeId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  roomId?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Employee ID must be a valid UUID' })
  employeeId?: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Type(() => Number)
  limit?: number = 20;

  // Sorting
  @IsOptional()
  @IsString()
  @IsIn(['assetCode', 'name', 'createdAt', 'updatedAt', 'acquisitionDate'], {
    message: 'Invalid sort field',
  })
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
