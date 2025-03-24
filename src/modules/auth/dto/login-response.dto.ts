// src/modules/auth/dto/login-response.dto.ts
export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
