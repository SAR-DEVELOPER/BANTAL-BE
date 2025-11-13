import { IsArray, IsUUID, IsEmail, IsOptional } from 'class-validator';

export class UpdateParticipantsDto {
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  internalAttendantIds?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail(undefined, { each: true })
  emailAttendants?: string[];
}

