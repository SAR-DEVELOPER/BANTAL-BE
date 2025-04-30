import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakUrlHelper {
  constructor(private configService: ConfigService) {}

  /**
   * Get the Keycloak URL from configuration, using the same pattern
   * as the successful login flow
   * 
   * @returns The Keycloak URL
   */
  getKeycloakUrl(): string {
    // Option 1: Check for direct URL configuration
    const directUrl = this.configService.get<string>('KEYCLOAK_URL');
    if (directUrl) {
      return directUrl;
    }

    // Option 2: Build from host and port - this matches the login flow
    const host = this.configService.get<string>('KEYCLOAK_HOST') || 'keycloak';
    const port = this.configService.get<string>('KEYCLOAK_PORT') || '8080';
    
    // Use http for internal Docker communication, same as the login flow
    return `http://${host}:${port}`;
  }

  /**
   * Extract hostname from the Keycloak URL or configuration
   * @returns The hostname of the Keycloak server
   */
  extractHostname(): string {
    // First try to get from direct host config
    const host = this.configService.get<string>('KEYCLOAK_HOST');
    if (host) {
      return host;
    }
    
    try {
      // Otherwise, extract from URL
      const url = new URL(this.getKeycloakUrl());
      return url.hostname;
    } catch (e) {
      return 'keycloak';
    }
  }
  
  /**
   * Extract port from the Keycloak URL or configuration
   * @returns The port of the Keycloak server
   */
  extractPort(): string {
    // First try to get from direct port config
    const port = this.configService.get<string>('KEYCLOAK_PORT');
    if (port) {
      return port;
    }
    
    try {
      // Otherwise, extract from URL
      const url = new URL(this.getKeycloakUrl());
      return url.port || '8080';
    } catch (e) {
      return '8080';
    }
  }

  /**
   * Get the Keycloak realm from configuration
   * @returns The Keycloak realm name
   */
  getKeycloakRealm(): string {
    return this.configService.get<string>('KEYCLOAK_REALM') || 'BANTAL';
  }
} 