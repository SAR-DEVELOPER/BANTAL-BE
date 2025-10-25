import { Type } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsNotEmpty, IsArray } from 'class-validator';

export class CreateSuratTugasDto {
  @IsString()
  @IsNotEmpty()
  namaPekerjaan: string;

  @IsString()
  @IsNotEmpty()
  deskripsiPekerjaan: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  tanggalMulai: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  tanggalSelesai: Date;

  @IsString()
  @IsNotEmpty()
  lokasi: string;

  @IsUUID()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsUUID()
  @IsNotEmpty()
  signerId: string;
  
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  tanggalSuratTugas: Date;

  @IsString()
  @IsNotEmpty()
  createdBy: string;
  
}