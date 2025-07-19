import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class LevelsService {
    constructor(private readonly firebaseService: FirebaseService) { }

    async getLevelsByDifficulty(difficulty: string, userId: string) {
        const db = this.firebaseService.getFirestore();
        const levelsRef = db.collection('levels').where('difficulty', '==', difficulty);
        const snapshot = await levelsRef.limit(10).get();

        const levels = [];
        snapshot.forEach(doc => {
            levels.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return levels;
    }

    async getRandomLevel(difficulty: string, userId: string) {
        const db = this.firebaseService.getFirestore();
        const levelsRef = db.collection('levels').where('difficulty', '==', difficulty);
        const snapshot = await levelsRef.limit(1).get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }
} 