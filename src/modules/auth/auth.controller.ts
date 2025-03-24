import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenDto, RefreshTokenResponseDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Get('login-info')
    async getLoginInfo() {
        return this.authService.getLoginInfo();
    }

    @Post('test')
    @HttpCode(HttpStatus.OK)
    async testEndpoint() {
        return { message: 'Auth controller is working' };
    }
}