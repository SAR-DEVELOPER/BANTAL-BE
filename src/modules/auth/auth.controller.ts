import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  HttpCode,
  UnauthorizedException,
  InternalServerErrorException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EnhancedJwtAuthGuard } from './guards/enhanced-jwt-auth.guard';
import { KeycloakUrlHelper } from './keycloak-url.helper';
import { IdentityService } from '../identity/identity.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly keycloakUrlHelper: KeycloakUrlHelper,
    private readonly identityService: IdentityService,
  ) { }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Res() res: Response
  ) {
    console.log('Callback called');
    console.log('code', code);
    if (!code) {
      throw new InternalServerErrorException('Missing authorization code');
    }

    try {
      console.log('Exchanging code for tokens');
      const tokens = await this.authService.exchangeCodeForTokens(code);
      console.log('Tokens exchanged');
      console.log('tokens', tokens);
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        domain: process.env.PARENT_HOSTNAME,
        path: '/',
      };

      // Set secure cookies for access and refresh tokens
      res.cookie('auth_session', tokens.access_token, {
        ...cookieOptions,
        maxAge: tokens.expires_in * 1000, // expiresIn is in seconds
      });

      res.cookie('refresh_token', tokens.refresh_token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // e.g., 24 hours
      });

      // Redirect back to frontend
      const redirectUri = this.configService.get<string>('AUTH_REDIRECT_URI') || process.env.FRONT_END_HOSTNAME + '/dashboard/landing';
      return res.redirect(redirectUri);
    } catch (err) {
      console.error('Failed to handle /auth/callback:', err);
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  /**
   * Refreshes the access token using the refresh token stored in HTTP-only cookie.
   */
  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    console.log('Refreshing token');
    console.log('cookies', req.cookies);
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing.');
    }

    try {
      const tokenResponse = await this.authService.refreshTokens(refreshToken);

      // Validate user against internal identity database with new token
      await this.authService.validateUserFromToken(tokenResponse.access_token);

      const isProd = this.configService.get('NODE_ENV') === 'production';

      const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for cross-site cookies
        sameSite: 'none' as const,
        path: '/',
        domain: process.env.PARENT_HOSTNAME,
      };

      // Set new access token
      res.cookie('auth_session', tokenResponse.access_token, {
        ...cookieOptions,
        maxAge: tokenResponse.expires_in * 1000, // convert to ms
      });

      // Set new refresh token
      res.cookie('refresh_token', tokenResponse.refresh_token, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      return res.json({ success: true });
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  @Get('profile')
  @UseGuards(EnhancedJwtAuthGuard)
  getProfile(@Req() req: Request) {
    const token = req.cookies?.['auth_session'];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token) as any;
    console.log('decoded', decoded);
    return {
      // JWT token information
      jwt: {
        email: req.user?.email,
        name: req.user?.name,
        username: req.user?.preferred_username,
        keycloakId: req.user?.sub,
      },
      // Internal identity database information
      identity: {
        id: req.identity?.id,
        email: req.identity?.email,
        name: req.identity?.name,
        department: req.identity?.department,
        jobTitle: req.identity?.jobTitle,
        role: req.identity?.role,
        status: req.identity?.status,
        isActive: req.identity?.isActive,
        externalId: req.identity?.externalId,
        keycloakId: req.identity?.keycloakId,
        createdAt: req.identity?.createdAt,
        updatedAt: req.identity?.updatedAt,
      },
      // DEBUG: Add debug information
      debug: {
        tokenDecoded: {
          sub: decoded?.sub,
          email: decoded?.email,
          iss: decoded?.iss,
          iat: decoded?.iat,
          exp: decoded?.exp,
        },
        syncStatus: {
          keycloakIdInDb: !!req.identity?.keycloakId,
          keycloakIdFromToken: decoded?.sub,
          keycloakIdMatches: req.identity?.keycloakId === decoded?.sub,
          needsSync: !req.identity?.keycloakId || req.identity?.keycloakId !== decoded?.sub,
        }
      }
    };
  }

  @Get('profile-legacy')
  @UseGuards(JwtAuthGuard)
  getProfileLegacy(@Req() req: Request) {
    return {
      message: 'This endpoint uses the old JWT guard (no database validation)',
      email: req.user?.email,
      name: req.user?.name,
      username: req.user?.preferred_username,
      keycloakId: req.user?.sub,
    };
  }

  @Get('user-info')
  @UseGuards(EnhancedJwtAuthGuard)
  async getUserInfo(@Req() req: Request) {
    // Update last login time
    if (req.identity) {
      await this.identityService.updateLastLogin(req.identity);
    }

    return {
      message: 'Enhanced authentication successful',
      user: {
        id: req.identity?.id,
        email: req.identity?.email,
        name: req.identity?.name,
        department: req.identity?.department,
        jobTitle: req.identity?.jobTitle,
        role: req.identity?.role,
        lastLogin: req.identity?.updatedAt,
      },
      jwtClaims: {
        sub: req.user?.sub,
        email: req.user?.email,
        preferred_username: req.user?.preferred_username,
      }
    };
  }

  @Get("logout")
  logout(@Res() res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: process.env.PARENT_HOSTNAME,
      path: '/',
    };

    // 1. Clear cookies
    res.clearCookie('auth_session', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    // 2. Optional: redirect to Keycloak logout endpoint
    const keycloakUrl = this.keycloakUrlHelper.getKeycloakUrl();
    const realm = this.keycloakUrlHelper.getKeycloakRealm();
    const logoutRedirectUri = this.configService.get<string>('FRONT_END_HOSTNAME') || process.env.FRONT_END_HOSTNAME + '/dashboard/landing';
    const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent(logoutRedirectUri)}`;
    return res.redirect(logoutUrl);
  }

  @Get("health")
  async health() {
    return {
      status: "ok",
      message: "Auth service is healthy",
    }
  }

  /**
   * Get Keycloak environment configuration (for debugging)
   * @returns Current Keycloak environment settings
   */
  @Get('keycloak-config')
  getKeycloakConfig() {
    return {
      url: this.keycloakUrlHelper.getKeycloakUrl(),
      realm: this.keycloakUrlHelper.getKeycloakRealm(),
      host: this.configService.get<string>('KEYCLOAK_HOST'),
      port: this.configService.get<string>('KEYCLOAK_PORT'),
      directUrl: this.configService.get<string>('KEYCLOAK_URL'),
      clientId: this.configService.get<string>('KEYCLOAK_CLIENT_ID'),
      clientSecretSet: !!this.configService.get<string>('KEYCLOAK_CLIENT_SECRET'),
    };
  }

  @Get('debug-token')
  @UseGuards(EnhancedJwtAuthGuard)
  async debugToken(@Req() req: Request) {
    const token = req.cookies?.['auth_session'];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token) as any;

    return {
      message: 'Debug information for current token',
      jwtPayload: {
        sub: decoded?.sub,
        email: decoded?.email,
        preferred_username: decoded?.preferred_username,
        name: decoded?.name,
        iat: decoded?.iat,
        exp: decoded?.exp,
        iss: decoded?.iss,
      },
      identityFromDatabase: {
        id: req.identity?.id,
        email: req.identity?.email,
        keycloakId: req.identity?.keycloakId,
        externalId: req.identity?.externalId,
        isActive: req.identity?.isActive,
        status: req.identity?.status,
        updatedAt: req.identity?.updatedAt,
      },
      syncStatus: {
        keycloakIdMatches: req.identity?.keycloakId === decoded?.sub,
        keycloakIdInDb: !!req.identity?.keycloakId,
        keycloakIdFromToken: decoded?.sub,
      }
    };
  }

  @Post('sync-my-keycloak-id')
  @UseGuards(EnhancedJwtAuthGuard)
  async syncMyKeycloakId(@Req() req: Request) {
    const token = req.cookies?.['auth_session'];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token) as any;

    if (!decoded?.sub || !decoded?.email) {
      throw new InternalServerErrorException('Invalid token: missing user information');
    }

    try {
      // Force sync the user
      const updatedIdentity = await this.identityService.validateAndSyncUser(decoded.email, decoded.sub);
      
      return {
        message: 'Keycloak ID sync completed',
        before: {
          keycloakId: req.identity?.keycloakId,
        },
        after: {
          keycloakId: updatedIdentity.keycloakId,
        },
        tokenInfo: {
          email: decoded.email,
          keycloakId: decoded.sub,
        }
      };
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw new InternalServerErrorException(`Sync failed: ${error.message}`);
    }
  }
}
