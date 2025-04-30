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
import { KeycloakUrlHelper } from './keycloak-url.helper';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly keycloakUrlHelper: KeycloakUrlHelper,
  ) { }

  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Res() res: Response
  ) {
    if (!code) {
      throw new InternalServerErrorException('Missing authorization code');
    }

    try {
      const tokens = await this.authService.exchangeCodeForTokens(code);

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        domain: '.will-soon.com',
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
      const redirectUri = this.configService.get<string>('AUTH_REDIRECT_URI') || 'https://will-soon.com/dashboard/landing';
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

      const isProd = this.configService.get('NODE_ENV') === 'production';

      const cookieOptions = {
        httpOnly: true,
        secure: true, // Always true for cross-site cookies
        sameSite: 'none' as const,
        path: '/',
        domain: '.will-soon.com',
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
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return {
      email: req.user?.email,
      name: req.user?.name,
      username: req.user?.preferred_username,
    };
  }

  @Get("logout")
  logout(@Res() res: Response) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      domain: '.will-soon.com',
      path: '/',
    };

    // 1. Clear cookies
    res.clearCookie('auth_session', cookieOptions);
    res.clearCookie('refresh_token', cookieOptions);

    // 2. Optional: redirect to Keycloak logout endpoint
    const keycloakUrl = this.keycloakUrlHelper.getKeycloakUrl();
    const realm = this.keycloakUrlHelper.getKeycloakRealm();
    const logoutUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/logout?redirect_uri=${encodeURIComponent('https://www.will-soon.com/')}`;
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
}
