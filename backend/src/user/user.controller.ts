import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from '../shared/guards/firebase-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('progress')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Obtener progreso del usuario' })
    @ApiResponse({ status: 200, description: 'Progreso obtenido' })
    async getProgress(@Request() req) {
        return this.userService.getProgress(req.user.uid);
    }

    @Get('stats')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Obtener estadísticas del usuario' })
    @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
    async getStats(@Request() req) {
        return this.userService.getStats(req.user.uid);
    }
} 