import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class UserService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async getProgress(userId: string) {
        const db = this.firebaseService.getFirestore();
        const progressDoc = await db.collection('progress').doc(userId).get();

        if (!progressDoc.exists) {
            return {
                levelsCompleted: 0,
                currentStreak: 0,
                bestStreak: 0,
                totalTime: 0,
            };
        }

        return progressDoc.data();
    }

    async getStats(userId: string) {
        const db = this.firebaseService.getFirestore();
        const statsDoc = await db.collection('stats').doc(userId).get();

        if (!statsDoc.exists) {
            return {
                totalLevels: 0,
                averageTime: 0,
                favoriteDifficulty: 'normal',
                lastPlayed: null,
            };
        }

        return statsDoc.data();
    }
} 