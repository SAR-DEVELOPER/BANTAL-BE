import { IsString, IsUUID, IsNotEmpty } from 'class-validator';

/**
 * DTO for SuratTagihanNonBulanan (Non-Monthly Billing Letter) document type
 */
export class SuratTagihanNonBulananDto {
  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  documentDescription: string;
} 