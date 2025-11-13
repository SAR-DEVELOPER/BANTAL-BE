import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class UpdateHostKeyDto {
    @IsString()
    @IsNotEmpty()
    hostKey: string;

    @IsDateString()
    @IsNotEmpty()
    setTime: string;

    @IsDateString()
    @IsNotEmpty()
    expiresAt: string;
}