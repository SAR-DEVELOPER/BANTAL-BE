import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ZoomMeetingDto {
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? value : parsed;
    }
    return value;
  })
  id: number | string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? parseInt(value, 10) : value))
  @IsNumber()
  type: number;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  passcode?: string;

  @IsOptional()
  @IsBoolean()
  use_pmi?: boolean;

  @IsOptional()
  @IsBoolean()
  is_host?: boolean;

  @IsOptional()
  @IsString()
  join_url?: string;

  @IsOptional()
  @IsString()
  created_at?: string;
}

export class SyncForwardDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZoomMeetingDto)
  meetings: ZoomMeetingDto[];
}

