import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MeetingStatus } from '../entities/meeting.entity';

export class CreateMeetingDto {
  @IsNotEmpty()
  @IsString()
  meetingTitle: string;

  @IsNotEmpty()
  @IsDateString()
  timeStart: string;

  @IsNotEmpty()
  @IsDateString()
  timeEnd: string;

  @IsOptional()
  @IsUUID()
  requestedById?: string | null;

  @IsOptional()
  @IsUUID()
  accountId?: string | null;

  @IsOptional()
  @IsUUID()
  hostId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  internalAttendants?: string[];

  @IsOptional()
  @IsArray()
  @IsEmail(undefined, { each: true })
  emailAttendants?: string[];
}

