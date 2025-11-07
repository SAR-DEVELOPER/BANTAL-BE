import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { UserIdentity } from '../interfaces/user-identity.interface';
import { IdentityService } from '../../identity/identity.service';

@Injectable()
export class EnhancedJwtAuthGuard implements CanActivate {
  private jwksClient = jwksRsa({
    jwksUri: process.env.KEYCLOAK_URL + '/realms/BANTAL/protocol/openid-connect/certs',
    cache: true,
    rateLimit: true,
  });

  constructor(private readonly identityService: IdentityService) {}

  private getKey = (header, callback) => {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      const signingKey = key?.getPublicKey();
      callback(err, signingKey);
    });
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies?.['auth_session'];

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      // Verify JWT token
      const decoded = await new Promise<UserIdentity>((resolve, reject) => {
        jwt.verify(token, this.getKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as UserIdentity);
          }
        });
      });

      // Validate user against internal identity database
      let identity = await this.identityService.findByEmail(decoded.email);
      
      if (!identity) {
        throw new ForbiddenException(`User ${decoded.email} is not authorized to access this system`);
      }

      if (!identity.isActive || identity.status !== 'active') {
        throw new ForbiddenException(`User account for ${decoded.email} is not active`);
      }

      // Sync Keycloak ID if needed
      if (!identity.keycloakId) {
        // First time login - set the Keycloak ID
        console.log(`Setting Keycloak ID for user ${decoded.email}: ${decoded.sub}`);
        identity = await this.identityService.validateAndSyncUser(decoded.email, decoded.sub);
      } else if (identity.keycloakId !== decoded.sub) {
        // Keycloak ID mismatch - update it
        console.warn(`Keycloak ID mismatch for user ${decoded.email}. Old: ${identity.keycloakId}, New: ${decoded.sub}`);
        identity = await this.identityService.validateAndSyncUser(decoded.email, decoded.sub);
      }

      // Attach both JWT user data and internal identity to request
      req.user = decoded;
      req.identity = identity;
      
      return true;
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      
      console.error('Enhanced JWT validation error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
} 