import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LevelsService } from './levels.service';
import { FirebaseAuthGuard } from '../shared/guards/firebase-auth.guard';

@ApiTags('levels')
@Controller('levels')
export class LevelsController {
    constructor(private readonly levelsService: LevelsService) { }

    @Get(':difficulty')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Obtener niveles por dificultad' })
    @ApiResponse({ status: 200, description: 'Niveles obtenidos' })
    async getLevelsByDifficulty(
        @Param('difficulty') difficulty: string,
        @Request() req
    ) {
        return this.levelsService.getLevelsByDifficulty(difficulty, req.user.uid);
    }

    @Get(':difficulty/random')
    @UseGuards(FirebaseAuthGuard)
    @ApiOperation({ summary: 'Obtener un nivel aleatorio por dificultad' })
    @ApiResponse({ status: 200, description: 'Nivel obtenido' })
    async getRandomLevel(
        @Param('difficulty') difficulty: string,
        @Request() req
    ) {
        return this.levelsService.getRandomLevel(difficulty, req.user.uid);
    }
} 