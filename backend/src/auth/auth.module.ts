import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseService } from '../shared/firebase.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, FirebaseService],
    exports: [AuthService],
})
export class AuthModule { } 