// src/auth/guards/jwt-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { UserIdentity } from '../interfaces/user-identity.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private jwksClient = jwksRsa({
    jwksUri: 'https://auth.process.will-soon.com/realms/BANTAL/protocol/openid-connect/certs',
    cache: true,
    rateLimit: true,
  });

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
      throw new UnauthorizedException('Missing token');
    }

    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, this.getKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });

      req.user = decoded as UserIdentity;
      return true;
    } catch (err) {
      console.error('JWT validation error:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
