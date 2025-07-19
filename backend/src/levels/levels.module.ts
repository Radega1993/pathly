import { Module } from '@nestjs/common';
import { LevelsController } from './levels.controller';
import { LevelsService } from './levels.service';
import { FirebaseService } from '../shared/firebase.service';

@Module({
    controllers: [LevelsController],
    providers: [LevelsService, FirebaseService],
    exports: [LevelsService],
})
export class LevelsModule { } 