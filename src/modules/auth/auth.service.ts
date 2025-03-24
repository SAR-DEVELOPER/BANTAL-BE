import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RefreshTokenDto,
  RefreshTokenResponseDto,
} from './dto/refresh-token.dto';
import { TokenResponse } from './interfaces/token-response.interface';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    try {
      // Decode and examine the token first
      console.log('Examining refresh token:');
      const decodedToken = this.decodeToken(refreshTokenDto.refresh_token);
      const keycloakHost =
        this.configService.get<string>('KEYCLOAK_HOST') || 'keycloak';
      const keycloakPort =
        this.configService.get<string>('KEYCLOAK_PORT') || '8080';
      const keycloakUrl = `http://${keycloakHost}:${keycloakPort}`;

      const realm = this.configService.get<string>('KEYCLOAK_REALM') || '';
      const clientId =
        this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';
      const clientSecret = this.configService.get<string>(
        'KEYCLOAK_CLIENT_SECRET',
      );

      console.log(`Keycloak URL: ${keycloakUrl}`);
      console.log(`Realm: ${realm}`);
      console.log(`Client ID: ${clientId}`);
      console.log(`Has Client Secret: ${!!clientSecret}`);

      const tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
      console.log(`Token endpoint: ${tokenEndpoint}`);

      // Prepare request parameters
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshTokenDto.refresh_token);

      console.log(
        `Refresh token length: ${refreshTokenDto.refresh_token.length}`,
      );
      console.log('Sending token refresh request...');

      // Make the request with Basic Auth header for client authentication
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        },
        body: params.toString(),
      });

      console.log(`Keycloak response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Error response: ${errorText}`);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error_description: errorText };
        }
        throw new HttpException(
          errorData.error_description || 'Failed to refresh token',
          response.status,
        );
      }

      const data: TokenResponse = await response.json();
      console.log('Token refreshed successfully');

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error) {
      console.error('Error in refreshToken:', error);

      // If error is already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      // Generic error case
      throw new HttpException(
        'Failed to refresh token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLoginInfo() {
    try {
      const keycloakHost =
        this.configService.get<string>('KEYCLOAK_HOST') || 'keycloak';
      const keycloakPort =
        this.configService.get<string>('KEYCLOAK_PORT') || '8080';
      const keycloakUrl = `http://${keycloakHost}:${keycloakPort}`;

      const realm = this.configService.get<string>('KEYCLOAK_REALM') || '';
      const clientId =
        this.configService.get<string>('KEYCLOAK_CLIENT_ID') || '';

      // Get realm info from Keycloak
      const realmInfoUrl = `${keycloakUrl}/realms/${realm}`;
      console.log(`Fetching realm info from: ${realmInfoUrl}`);

      const realmResponse = await fetch(realmInfoUrl);
      let realmInfo = {};

      if (realmResponse.ok) {
        realmInfo = await realmResponse.json();
        console.log('Realm info obtained successfully');
      } else {
        console.log(`Failed to get realm info: ${realmResponse.status}`);
      }

      // Build login URL
      const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth`;
      const redirectUri = 'http://localhost:3000/auth/callback'; // This should match your frontend redirect URI

      const loginUrl = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid`;

      // Get well-known configuration
      const wellKnownUrl = `${keycloakUrl}/realms/${realm}/.well-known/openid-configuration`;
      const wellKnownResponse = await fetch(wellKnownUrl);
      let openidConfig = {};

      if (wellKnownResponse.ok) {
        openidConfig = await wellKnownResponse.json();
        console.log('OpenID configuration obtained successfully');
      } else {
        console.log(
          `Failed to get OpenID configuration: ${wellKnownResponse.status}`,
        );
      }

      return {
        message: 'Login information for troubleshooting',
        issuerInfo: {
          expectedIssuer: `${keycloakUrl}/realms/${realm}`,
          openidIssuer: openidConfig['issuer'],
          realmIssuer: realmInfo['issuer'],
        },
        loginFlow: {
          authorizationUrl: loginUrl,
          redirectUri,
          clientId,
        },
        openidConfiguration: openidConfig,
        troubleshooting: {
          message: `To fix the issuer mismatch, make sure that Keycloak's Frontend URL and Web Origins match the URL that generated your tokens`,
          checkFrontendUrl: `Go to Keycloak admin console -> ${realm} realm -> Realm Settings -> General tab -> Frontend URL`,
          checkWebOrigins: `Go to Keycloak admin console -> ${realm} realm -> Clients -> ${clientId} -> Settings -> Web Origins`,
        },
      };
    } catch (error) {
      console.error('Error getting login info:', error);
      return {
        error: 'Failed to get login information',
        message: error.message,
      };
    }
  }

  // Add this function to your AuthService
  private decodeToken(token: string) {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Not a valid JWT token structure');
        return null;
      }

      // Base64 decode and parse the payload part (second part)
      const payload = Buffer.from(parts[1], 'base64').toString();
      const parsed = JSON.parse(payload);

      console.log('Token decoded successfully:');
      console.log('Issuer:', parsed.iss);
      console.log('Subject:', parsed.sub);
      console.log('Audience:', parsed.aud);
      console.log('Expires at:', new Date(parsed.exp * 1000).toISOString());
      console.log('Issued at:', new Date(parsed.iat * 1000).toISOString());

      return parsed;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
