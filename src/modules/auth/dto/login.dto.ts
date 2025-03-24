// src/modules/auth/dto/login.dto.ts
import { IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
