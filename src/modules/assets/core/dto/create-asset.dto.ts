import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  Min,
  MaxLength,
  IsUrl
} from "class-validator";
import { Type } from "class-transformer";

export class CreateAssetDto {
  // Basic Asset Information
  @IsNotEmpty({ message: 'Asset name is required' })
  @IsString()
  @MaxLength(255, { message: 'Asset name must not exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Asset code is required' })
  @IsString()
  @MaxLength(255, { message: 'Asset code must not exceed 255 characters' })
  assetCode: string;

  @IsNotEmpty({ message: 'Asset Description is required' })
  @IsString()
  @MaxLength(1000, { message: 'Asset description must not exceed 1000 characters' })
  description: string;

  @IsOptional()
  @IsUrl({}, { message: 'Photo URL must be a valid URL' })
  @MaxLength(255, { message: 'Photo URL must not exceed 255 characters' })
  photoUrl?: string;

  // Classification
  @IsNotEmpty({ message: 'Asset group is required' })
  @IsUUID('4', { message: 'Asset group ID must be a valid UUID' })
  assetGroupId: string;

  @IsNotEmpty({ message: 'Asset type is required' })
  @IsUUID('4', { message: 'Asset type ID must be a valid UUID' })
  assetTypeId: string;

  // Location Information
  @IsNotEmpty({ message: 'Company is required' })
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @IsNotEmpty({ message: 'Office is required' })
  @IsUUID('4', { message: 'Office ID must be a valid UUID' })
  officeId: string;

  @IsOptional()
  @IsUUID('4', { message: 'Room ID must be a valid UUID' })
  roomId?: string;

  // Ownership/Assignment
  @IsOptional()
  @IsUUID('4', { message: 'Employee ID must be a valid UUID' })
  employeeId?: string;

  // Financial Information
  @IsOptional()
  @IsDateString({}, { message: 'Acquisition date must be a valid date string (ISO 8601)' })
  acquisitionDate?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'Acquisition price must be a number with max 4 decimal places' })
  @Min(0, { message: 'Acquisition price must be a positive number' })
  @Type(() => Number)
  acquisitionPrice?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 }, { message: 'VAT must be a number with max 4 decimal places' })
  @Min(0, { message: 'VAT must be a positive number' })
  @Type(() => Number)
  vat?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tax invoice number must not exceed 255 characters' })
  taxInvoiceNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tax invoice file must not exceed 255 characters' })
  taxInvoiceFile?: string;

  @IsString()
  @MaxLength(255, { message: 'Invoice number must not exceed 255 characters' })
  invoiceNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Invoice file must not exceed 255 characters' })
  invoiceFile?: string;

  // Condition and Status
  @IsNotEmpty({ message: 'Current condition is required' })
  @IsString()
  currentCondition: string;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  @Type(() => Boolean)
  isActive?: boolean;

  // Audit Fields
  @IsNotEmpty({ message: 'Created by is required' })
  @IsUUID('4', { message: 'Created by must be a valid UUID' })
  createdById: string;

  @IsNotEmpty({ message: 'Updated by is required' })
  @IsUUID('4', { message: 'Updated by must be a valid UUID' })
  updatedById: string;
}