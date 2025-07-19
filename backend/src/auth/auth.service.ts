import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class AuthService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async verifyToken(token: string) {
        try {
            const decodedToken = await this.firebaseService.verifyToken(token);
            return {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }

    async getProfile(userId: string) {
        try {
            const userRecord = await this.firebaseService.getAuth().getUser(userId);
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                emailVerified: userRecord.emailVerified,
            };
        } catch (error) {
            throw new UnauthorizedException('Usuario no encontrado');
        }
    }
} 