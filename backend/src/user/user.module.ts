import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseService } from '../shared/firebase.service';

@Module({
    controllers: [UserController],
    providers: [UserService, FirebaseService],
    exports: [UserService],
})
export class UserModule { } 