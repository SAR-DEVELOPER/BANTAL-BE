import {
  IsOptional,
  IsString,
  IsDateString,
  IsEmail,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { MeetingStatus } from '../entities/meeting.entity';

export class UpdateMeetingDto {
  @IsOptional()
  @IsString()
  meetingTitle?: string;

  @IsOptional()
  @IsDateString()
  timeStart?: string;

  @IsOptional()
  @IsDateString()
  timeEnd?: string;

  @IsOptional()
  @IsString()
  hostClaimKey?: string | null;

  @IsOptional()
  @IsEnum(MeetingStatus)
  status?: MeetingStatus;

  @IsOptional()
  @IsString()
  startUrl?: string | null;

  @IsOptional()
  @IsString()
  joinUrl?: string | null;

  @IsOptional()
  @IsString()
  password?: string | null;

  @IsOptional()
  @IsUUID()
  requestedById?: string | null;

  @IsOptional()
  @IsString()
  zoomId?: string | null;

  @IsOptional()
  @IsUUID()
  hostId?: string | null;
}

