import { Type } from 'class-transformer';
import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { DocumentCreateDto } from './document-create.dto';

/**
 * Unified DTO for document creation
 * 
 * This DTO combines the base document data and the type-specific document data
 * in a single request. It can be used in two ways:
 * 
 * 1. Send all data in a flat structure (the controller will separate them)
 * 2. Send data in a structured way, with baseDocument and specificDocument fields
 */
export class DocumentUnifiedDto {
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DocumentCreateDto)
  baseDocument?: DocumentCreateDto;

  @IsOptional()
  @IsObject()
  specificDocument?: any;

  // Other properties will be assigned to either baseDocument or specificDocument
  // based on the document type
  [key: string]: any;
} 