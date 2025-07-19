import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private firestore: admin.firestore.Firestore;

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        if (!admin.apps.length) {
            const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_KEY');

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        this.firestore = admin.firestore();
    }

    getFirestore(): admin.firestore.Firestore {
        return this.firestore;
    }

    getAuth(): admin.auth.Auth {
        return admin.auth();
    }

    async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
        return await admin.auth().verifyIdToken(token);
    }
} 