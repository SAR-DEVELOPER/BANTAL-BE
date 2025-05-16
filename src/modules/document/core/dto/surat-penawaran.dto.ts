import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO for SuratPenawaran (Offering Letter) document type
 */
export class SuratPenawaranDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;

  @IsString()
  @IsNotEmpty()
  offeredService: string;

  @IsUUID()
  @IsNotEmpty()
  personInChargeId: string;
} 