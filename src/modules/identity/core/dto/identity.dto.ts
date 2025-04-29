import { IsString, IsOptional, IsUUID, IsBoolean, IsEmail, IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';

export class IdentityDto {
  @IsUUID()
  id: string;

  @IsUUID()
  keycloakId: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  preferredUsername?: string;

  @IsBoolean()
  isActive: boolean;

  @IsEnum(Role)
  role: Role;

  createdAt: Date;
  updatedAt: Date;
} 