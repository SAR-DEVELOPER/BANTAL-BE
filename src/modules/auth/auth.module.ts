import { Module, Provider } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { KeycloakController } from './keycloak.controller';
import { KeycloakDirectController } from './keycloak-direct.controller';
import { KeycloakUrlHelper } from './keycloak-url.helper';
import { EnhancedJwtAuthGuard } from './guards/enhanced-jwt-auth.guard';
import { IdentityModule } from '../identity/identity.module';

// Custom provider to set up the token endpoint URL
const tokenEndpointProvider: Provider = {
  provide: 'KEYCLOAK_TOKEN_ENDPOINT',
  inject: [ConfigService, KeycloakUrlHelper],
  useFactory: (configService: ConfigService, keycloakUrlHelper: KeycloakUrlHelper) => {
    // Get the base URL
    const keycloakUrl = keycloakUrlHelper.getKeycloakUrl();
    const realm = keycloakUrlHelper.getKeycloakRealm();
    
    // Check if a token endpoint is explicitly configured
    const configuredEndpoint = configService.get<string>('KEYCLOAK_TOKEN_ENDPOINT');
    if (configuredEndpoint) {
      console.log(`Using configured token endpoint: ${configuredEndpoint}`);
      return configuredEndpoint;
    }
    
    // Otherwise, construct the token endpoint from the base URL and realm
    const tokenEndpoint = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
    console.log(`Using constructed token endpoint: ${tokenEndpoint}`);
    
    // Register this in the process environment for any code that uses process.env directly
    process.env.KEYCLOAK_TOKEN_ENDPOINT = tokenEndpoint;
    
    return tokenEndpoint;
  }
};

@Module({
  imports: [
    IdentityModule,
    // ConfigModule is already imported via JwtModule.registerAsync
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, KeycloakUrlHelper, tokenEndpointProvider, EnhancedJwtAuthGuard],
  controllers: [AuthController, KeycloakController, KeycloakDirectController],
  exports: [AuthService, KeycloakUrlHelper, EnhancedJwtAuthGuard],
})
export class AuthModule {}