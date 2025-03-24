// src/modules/auth/interfaces/keycloak-config.interface.ts
export interface KeycloakConfig {
  authServerUrl: string;
  realm: string;
  clientId: string;
  secret: string;
}
