import { Controller, Get, InternalServerErrorException, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { KeycloakUrlHelper } from './keycloak-url.helper';
import axios from 'axios';

@Controller('keycloak')
export class KeycloakController {
  constructor(
    private configService: ConfigService,
    private keycloakUrlHelper: KeycloakUrlHelper
  ) {}

  @Get('test-connection')
  async testKeycloakConnection(
    @Query('url') customUrl?: string,
    @Query('realm') customRealm?: string,
    @Query('timeout') timeoutStr?: string,
  ) {
    try {
      // Get configuration values, with optional overrides from query parameters
      const url = customUrl || this.keycloakUrlHelper.getKeycloakUrl();
      const realm = customRealm || this.keycloakUrlHelper.getKeycloakRealm();
      
      // Parse timeout parameter (default to 5000ms if not provided)
      const timeout = timeoutStr ? parseInt(timeoutStr, 10) : 5000;
      
      // Test well-known endpoint for connectivity
      const wellKnownUrl = `${url}/realms/${realm}/.well-known/openid-configuration`;
      console.log(`Testing connection to ${wellKnownUrl} with timeout ${timeout}ms`);
      
      try {
        const response = await axios.get(wellKnownUrl, { timeout });
        
        return { 
          success: true, 
          message: 'Successfully connected to Keycloak',
          keycloakUrl: url,
          keycloakRealm: realm,
          issuer: response.data.issuer,
          responseTime: response.headers['x-response-time'] || 'unknown'
        };
      } catch (error) {
        console.error(`Connection failed to ${wellKnownUrl}:`, error.message);
        throw new HttpException({
          status: HttpStatus.BAD_GATEWAY,
          error: 'Keycloak connection failed',
          details: `Could not reach ${wellKnownUrl}: ${error.message}`,
          url,
          realm
        }, HttpStatus.BAD_GATEWAY);
      }
    } catch (error) {
      // Generic error handling
      console.error('Keycloak connection test failed:', error);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Failed to test Keycloak connection',
        details: error.message,
        cause: error.code
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('url')
  getKeycloakUrl() {
    const url = this.keycloakUrlHelper.getKeycloakUrl();
    const realm = this.keycloakUrlHelper.getKeycloakRealm();
    
    return {
      url,
      realm,
      wellKnownUrl: `${url}/realms/${realm}/.well-known/openid-configuration`,
      tokenUrl: `${url}/realms/${realm}/protocol/openid-connect/token`,
      clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID'),
      clientSecretSet: !!this.configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
    };
  }
} 