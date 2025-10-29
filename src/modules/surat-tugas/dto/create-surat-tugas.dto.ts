import { Type } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';

class TimPenugasanDto {
  @IsUUID()
  @IsNotEmpty()
  personnelId: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class CreateSuratTugasDto {
  @IsUUID()
  @IsNotEmpty()
  masterDocumentListId: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimPenugasanDto)
  @IsNotEmpty()
  timPenugasan: TimPenugasanDto[];

}