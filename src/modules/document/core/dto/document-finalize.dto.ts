import { IsString, IsBoolean, IsUUID, IsOptional } from 'class-validator';
import 'multer';

export class DocumentFinalizeDto {
  @IsUUID()
  id: string;

  @IsString()
  finalizationSummary: string;

  @IsBoolean()
  physicalDelivery: boolean;

  @IsString()
  @IsOptional()
  documentType?: string;

  // Files will be handled by multer in the controller
  files?: Express.Multer.File[];
} 