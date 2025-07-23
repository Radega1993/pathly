import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './auth';

// Mock de AdMob para evitar errores de runtime
const AdMobInterstitial = {
    setAdUnitID: async (id: string) => {
        console.log('Mock: setAdUnitID called with:', id);
    },
    requestAdAsync: async () => {
        console.log('Mock: requestAdAsync called');
    },
    showAdAsync: async () => {
        console.log('Mock: showAdAsync called');
        return new Promise(resolve => setTimeout(resolve, 1000));
    }
};

const AdMobRewarded = {
    setAdUnitID: async (id: string) => {
        console.log('Mock: setAdUnitID called with:', id);
    },
    requestAdAsync: async () => {
        console.log('Mock: requestAdAsync called');
    },
    showAdAsync: async () => {
        console.log('Mock: showAdAsync called');
        return new Promise(resolve => setTimeout(resolve, 1000));
    },
    addEventListener: (event: string, callback: () => void) => {
        console.log('Mock: addEventListener called for:', event);
        // Simular que el usuario ganó la recompensa
        setTimeout(() => {
            if (event === 'rewardedVideoUserDidEarnReward') {
                callback();
            }
        }, 500);
    }
};

// Configuración de AdMob - IDs de producción
const PRODUCTION_IDS = {
    ANDROID_APP_ID: 'ca-app-pub-4553067801626383~6760188699',
    INTERSTITIAL: 'ca-app-pub-4553067801626383/6963330688',
    REWARDED: 'ca-app-pub-4553067801626383/6963330688',
};

console.log('✅ AdMob configuration loaded');
console.log('✅ Android App ID:', PRODUCTION_IDS.ANDROID_APP_ID);
console.log('✅ Interstitial ID:', PRODUCTION_IDS.INTERSTITIAL);
console.log('✅ Rewarded ID:', PRODUCTION_IDS.REWARDED);
console.log('✅ Using production IDs directly');

// IDs de prueba de AdMob para desarrollo
const TEST_IDS = {
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

// Usar IDs de producción
const AD_IDS = PRODUCTION_IDS;

// Claves para AsyncStorage
const STORAGE_KEYS = {
    LEVELS_COMPLETED: 'levels_completed_count',
    HINTS_USED_IN_LEVEL: 'hints_used_in_level_',
};



class AdsManager {
    private static instance: AdsManager;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): AdsManager {
        if (!AdsManager.instance) {
            AdsManager.instance = new AdsManager();
        }
        return AdsManager.instance;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('Initializing AdMob...');

            // Configurar anuncios intersticiales
            await AdMobInterstitial.setAdUnitID(AD_IDS.INTERSTITIAL);
            await AdMobInterstitial.requestAdAsync();

            // Configurar anuncios recompensados
            await AdMobRewarded.setAdUnitID(AD_IDS.REWARDED);
            await AdMobRewarded.requestAdAsync();

            this.isInitialized = true;
            console.log('✅ AdMob initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing AdMob:', error);
            // Marcar como inicializado para evitar reintentos infinitos
            this.isInitialized = true;
        }
    }

    async showInterstitialAd(): Promise<void> {
        try {
            // Verificar si el usuario es premium
            if (authService.isPremium()) {
                console.log('✅ User is premium, skipping interstitial ad');
                return;
            }

            if (!this.isInitialized) {
                await this.initialize();
            }

            console.log('Showing interstitial ad...');

            // Intentar mostrar el anuncio directamente
            await AdMobInterstitial.showAdAsync();
            console.log('✅ Interstitial ad completed');

            // Solicitar nuevo anuncio para la próxima vez
            await AdMobInterstitial.requestAdAsync();

        } catch (error) {
            console.error('❌ Error showing interstitial ad:', error);
        }
    }

    async showRewardedAd(): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                // Verificar si el usuario es premium
                if (authService.isPremium()) {
                    console.log('✅ User is premium, granting reward without ad');
                    resolve(true);
                    return;
                }

                if (!this.isInitialized) {
                    await this.initialize();
                }

                console.log('Showing rewarded ad...');

                let rewardEarned = false;

                // Configurar listeners para el anuncio recompensado
                AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
                    console.log('✅ User earned reward');
                    rewardEarned = true;
                });

                AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', () => {
                    console.log('❌ Rewarded ad failed to load');
                    resolve(false);
                });

                AdMobRewarded.addEventListener('rewardedVideoDidDismiss', () => {
                    console.log('Rewarded ad dismissed');
                    // Solicitar nuevo anuncio para la próxima vez
                    AdMobRewarded.requestAdAsync();
                    resolve(rewardEarned);
                });

                await AdMobRewarded.showAdAsync();

            } catch (error) {
                console.error('❌ Error showing rewarded ad:', error);
                resolve(false);
            }
        });
    }

    async incrementLevelsCompleted(): Promise<void> {
        try {
            const currentCount = await this.getLevelsCompletedCount();
            const newCount = currentCount + 1;
            await AsyncStorage.setItem(STORAGE_KEYS.LEVELS_COMPLETED, newCount.toString());
        } catch (error) {
            console.error('Error incrementing levels completed:', error);
        }
    }

    async getLevelsCompletedCount(): Promise<number> {
        try {
            const count = await AsyncStorage.getItem(STORAGE_KEYS.LEVELS_COMPLETED);
            return count ? parseInt(count, 10) : 0;
        } catch (error) {
            console.error('Error getting levels completed count:', error);
            return 0;
        }
    }

    async shouldShowInterstitialAd(): Promise<boolean> {
        const count = await this.getLevelsCompletedCount();
        return count > 0 && count % 4 === 0; // Mostrar cada 4 niveles
    }

    async getHintsUsedInLevel(levelId: string): Promise<number> {
        try {
            const hints = await AsyncStorage.getItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId);
            return hints ? parseInt(hints, 10) : 0;
        } catch (error) {
            console.error('Error getting hints used in level:', error);
            return 0;
        }
    }

    async incrementHintsUsedInLevel(levelId: string): Promise<void> {
        try {
            const currentHints = await this.getHintsUsedInLevel(levelId);
            const newHints = currentHints + 1;
            await AsyncStorage.setItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId, newHints.toString());
        } catch (error) {
            console.error('Error incrementing hints used in level:', error);
        }
    }

    async canUseFreeHint(levelId: string): Promise<boolean> {
        // Si el usuario es premium, siempre puede usar pistas
        if (authService.isPremium()) {
            return true;
        }

        const hintsUsed = await this.getHintsUsedInLevel(levelId);
        return hintsUsed === 0; // Solo la primera pista es gratuita para usuarios no premium
    }

    async resetHintsForLevel(levelId: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.HINTS_USED_IN_LEVEL + levelId);
        } catch (error) {
            console.error('Error resetting hints for level:', error);
        }
    }
}

// Exportar instancia singleton
export const adsManager = AdsManager.getInstance();

// Funciones de conveniencia
export const showInterstitialAd = (): Promise<void> => adsManager.showInterstitialAd();
export const showRewardedAd = (): Promise<boolean> => adsManager.showRewardedAd();
export const incrementLevelsCompleted = (): Promise<void> => adsManager.incrementLevelsCompleted();
export const shouldShowInterstitialAd = (): Promise<boolean> => adsManager.shouldShowInterstitialAd();
export const canUseFreeHint = (levelId: string): Promise<boolean> => adsManager.canUseFreeHint(levelId);
export const incrementHintsUsedInLevel = (levelId: string): Promise<void> => adsManager.incrementHintsUsedInLevel(levelId);
export const resetHintsForLevel = (levelId: string): Promise<void> => adsManager.resetHintsForLevel(levelId); 