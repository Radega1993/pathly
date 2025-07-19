import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { FirebaseAuthGuard } from '../shared/guards/firebase-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('verify')
    @ApiOperation({ summary: 'Verificar token de Firebase' })
    @ApiResponse({ status: 200, description: 'Token válido' })
    @ApiResponse({ status: 401, description: 'Token inválido' })
    async verifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
        return this.authService.verifyToken(verifyTokenDto.token);
    }

    @Get('profile')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Obtener perfil del usuario' })
    @ApiResponse({ status: 200, description: 'Perfil obtenido' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async getProfile(@Request() req) {
        return this.authService.getProfile(req.user);
    }
} 