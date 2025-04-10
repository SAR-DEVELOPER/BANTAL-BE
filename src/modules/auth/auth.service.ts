import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TokenResponse } from './interfaces/token-response.interface';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}


  async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const tokenEndpoint = this.configService.get<string>('KEYCLOAK_TOKEN_ENDPOINT') as string;
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') as string;
    const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET') as string;
    const redirectUri = this.configService.get<string>('KEYCLOAK_REDIRECT_URI') as string;
  
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });
  
    const { data } = await axios.post(tokenEndpoint, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  
    return data as TokenResponse;

  }

  /**
   * Uses the refresh token to get a new access token from Keycloak.
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const keycloakTokenEndpoint = this.configService.get<string>('KEYCLOAK_TOKEN_ENDPOINT');
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>('KEYCLOAK_CLIENT_SECRET');

    if (!keycloakTokenEndpoint || !clientId || !clientSecret) {
      throw new InternalServerErrorException('Missing required Keycloak configuration');
    }

    const form = new URLSearchParams();
    form.append('grant_type', 'refresh_token');
    form.append('refresh_token', refreshToken);
    form.append('client_id', clientId);
    form.append('client_secret', clientSecret);

    try {
      const { data } = await axios.post(keycloakTokenEndpoint, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        refresh_expires_in: data.refresh_expires_in,
        token_type: data.token_type,
        not_before_policy: data.not_before_policy,
        session_state: data.session_state,
        scope: data.scope,
      };
    } catch (error) {
      console.error('Failed to refresh tokens from Keycloak:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Token refresh request to Keycloak failed');
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
}
