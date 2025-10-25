import { IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';
import 'multer';

export class DocumentCreateDto {
  @IsString()
  documentNumber: string;

  @IsString()
  @IsOptional()
  documentExternalNumber: string;

  @IsString()
  documentName: string;

  @IsString()
  documentLegalDate: string;

  @IsNumber()
  @IsOptional()
  indexNumber?: number;

  @IsUUID()
  @IsOptional()
  createdById?: string;

  @IsUUID()
  @IsOptional()
  masterDivisionListId?: string;

  @IsUUID()
  @IsOptional()
  masterCompanyListId?: string;

  // File will be handled by multer in the controller
  file?: Express.Multer.File;
} 