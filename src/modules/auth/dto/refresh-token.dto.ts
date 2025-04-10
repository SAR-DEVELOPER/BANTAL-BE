export class RefreshTokenDto {
    refresh_token: string;
}
  
export class RefreshTokenResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

  // NOTE: We're no longer using RefreshTokenDto because we use cookie-based refresh
  //       and we're not sending the refresh token in the request body.
  //       We're sending the refresh token in the cookie instead.
