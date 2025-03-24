export class RefreshTokenDto {
    refresh_token: string;
  }
  
  export class RefreshTokenResponseDto {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }